import path from 'path';
import fs from 'fs';

// Import the bundled module using require to avoid top-level await
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bundleIndex = require(path.resolve(__dirname, '../../dist/index.js'));
const { CliRunner } = bundleIndex as { CliRunner: any };

describe('CliRunner Integration Test (Bundled)', () => {
  describe('exports', () => {
    it('should export CliRunner class from bundled index.js', () => {
      expect(CliRunner).toBeDefined();
      expect(typeof CliRunner).toBe('function');
    });

    it('should allow direct import from dist/CliRunner.js', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const CliRunnerDirect = require(path.resolve(__dirname, '../../dist/CliRunner.js'));
      expect(CliRunnerDirect.CliRunner).toBeDefined();
      expect(typeof CliRunnerDirect.CliRunner).toBe('function');
    });
  });

  describe('instance creation', () => {
    it('should create instance with no arguments', () => {
      const cli = new CliRunner();
      expect(cli).toBeInstanceOf(CliRunner);
    });

    it('should have expected methods', () => {
      const cli = new CliRunner();
      expect(typeof cli.start).toBe('function');
      expect(typeof cli.write).toBe('function');
      expect(typeof cli.writeln).toBe('function');
      expect(typeof cli.readStdout).toBe('function');
      expect(typeof cli.sendCtrlC).toBe('function');
      expect(typeof cli.dispose).toBe('function');
    });
  });

  describe('basic process execution', () => {
    let cli: any;

    beforeEach(() => {
      cli = new CliRunner();
    });

    afterEach(() => {
      if (cli) cli.dispose();
    });

    it('should throw when starting without command', () => {
      expect(() => {
        cli.start({} as any);
      }).toThrow(/command/i);
    });

    it('should execute node -v and capture stdout', async () => {
      await cli.start({ command: process.execPath, args: ['-v'], cwd: process.cwd() });
      const lines = await cli.readStdout().toLines(1000);
      expect(lines.length).toBeGreaterThan(0);
      expect(lines[0]).toMatch(/^v\d+\.\d+\.\d+/);
    });

    it('should throw when writing to non-started process', () => {
      const newCli = new CliRunner();
      expect(() => newCli.write('test')).toThrow();
      newCli.dispose();
    });
  });

  describe('process disposal and cleanup', () => {
    it('should clean up process on dispose', async () => {
      const cli = new CliRunner();
      await cli.start({ command: process.execPath, args: ['-v'], cwd: process.cwd() });
      cli.dispose();
      expect(() => cli.write('test')).toThrow();
    });
  });

  describe('EventEmitter behavior', () => {
    it('should be an EventEmitter with on/off methods', () => {
      const cli = new CliRunner();
      expect(typeof cli.on).toBe('function');
      expect(typeof cli.off).toBe('function');
      cli.dispose();
    });
  });

  describe('JSON reading capability', () => {
    let cli: any;

    beforeEach(() => {
      cli = new CliRunner();
    });
    afterEach(() => {
      if (cli) cli.dispose();
    });

    it('should parse JSON from stdout', async () => {
      await cli.start({ command: process.execPath, args: ['-e', 'console.log(JSON.stringify({test: "value"}))'], cwd: process.cwd() });
      const json = await cli.readStdout().toJson(1000);
      expect(json).toEqual({ test: 'value' });
    });

    it('should throw on invalid JSON', async () => {
      await cli.start({ command: process.execPath, args: ['-e', 'console.log("not json")'], cwd: process.cwd() });
      await expect(cli.readStdout().toJson(1000)).rejects.toThrow();
    });
  });

  describe('line reading capability', () => {
    let cli: any;

    beforeEach(() => { cli = new CliRunner(); });
    afterEach(() => { if (cli) cli.dispose(); });

    it('should read multiple lines from stdout', async () => {
      await cli.start({ command: process.execPath, args: ['-e', 'console.log("line1"); console.log("line2"); console.log("line3");'], cwd: process.cwd() });
      const lines = await cli.readStdout().toLines(1000);
      expect(lines.length).toBeGreaterThanOrEqual(1);
    });
  });
});

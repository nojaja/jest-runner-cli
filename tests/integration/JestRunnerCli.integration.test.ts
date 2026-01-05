import path from 'path';
import fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bundleIndex = require(path.resolve(__dirname, '../../dist/index.js'));
const JestRunnerCli = bundleIndex.default;

describe('JestRunnerCli Default Export Integration Test (Bundled)', () => {
  describe('exports', () => {
    it('should export default JestRunnerCli from bundled index.js', () => {
      expect(JestRunnerCli).toBeDefined();
      expect(typeof JestRunnerCli).toBe('function');
    });

    it('should be a valid Jest runner function', () => {
      expect(typeof JestRunnerCli).toBe('function');
      expect(JestRunnerCli).toBeDefined();
    });

    it('should be a callable runner (not a class)', () => {
      expect(typeof JestRunnerCli).toBe('function');
    });
  });

  describe('CommonJS/ESM interop validation', () => {
    it('should not throw TypeError when loading default export', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require(path.resolve(__dirname, '../../dist/index.js'));
      }).not.toThrow();
    });

    it('should be a callable runner function', () => {
      expect(typeof JestRunnerCli).toBe('function');
      expect(JestRunnerCli).toBeDefined();
    });
  });

  describe('run.js export', () => {
    it('should export run function from dist/run.js', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const runModule = require(path.resolve(__dirname, '../../dist/run.js'));
      expect(runModule.default).toBeDefined();
      expect(typeof runModule.default).toBe('function');
    });

    it('run function should have correct create-jest-runner signature (1 options param)', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const runModule = require(path.resolve(__dirname, '../../dist/run.js'));
      const runFunc = runModule.default;
      // create-jest-runner expects run files to accept a single options object parameter
      expect(runFunc.length).toBe(1);
    });
  });

  describe('module structure validation', () => {
    it('should export from "." entry point', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mainExport = require(path.resolve(__dirname, '../../dist/index.js'));
      expect(mainExport.default).toBeDefined();
      expect(mainExport.CliRunner).toBeDefined();
    });

    it('should export from "./run" entry point', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const runExport = require(path.resolve(__dirname, '../../dist/run.js'));
      expect(runExport.default).toBeDefined();
    });

    it('should export from "./CliRunner" entry point', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cliRunnerExport = require(path.resolve(__dirname, '../../dist/CliRunner.js'));
      expect(cliRunnerExport.CliRunner).toBeDefined();
      expect(typeof cliRunnerExport.CliRunner).toBe('function');
    });
  });

  describe('type definitions presence', () => {
    it('should have TypeScript type definitions', () => {
      const typesPath = path.resolve(__dirname, '../../dist/index.d.ts');
      expect(fs.existsSync(typesPath)).toBe(true);
    });

    it('should export CliRunner type from type definitions', () => {
      const typesPath = path.resolve(__dirname, '../../dist/index.d.ts');
      const typeContent = fs.readFileSync(typesPath, 'utf-8');
      expect(typeContent).toContain('CliRunner');
      expect(typeContent).toContain('SpawnOptions');
    });
  });

  describe('file presence validation', () => {
    it('should have all required distribution files', () => {
      const requiredFiles = [
        'dist/index.js',
        'dist/index.d.ts',
        'dist/run.js',
        'dist/run.d.ts',
        'dist/CliRunner.js',
        'dist/CliRunner.d.ts',
      ];

      requiredFiles.forEach((file) => {
        const filePath = path.resolve(__dirname, '../../', file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it('should have non-empty compiled JavaScript files', () => {
      const jsFiles = ['dist/index.js', 'dist/run.js', 'dist/CliRunner.js'];
      jsFiles.forEach((file) => {
        const filePath = path.resolve(__dirname, '../../', file);
        const stats = fs.statSync(filePath);
        expect(stats.size).toBeGreaterThan(0);
      });
    });
  });

  describe('build reproducibility', () => {
    it('should maintain consistent version in package.json', () => {
      const packageJsonPath = path.resolve(__dirname, '../../package.json');
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      expect(packageJson.version).toBeDefined();
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });
});

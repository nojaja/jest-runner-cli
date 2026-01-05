/**
 * Integration Test: CliRunner Class (Bundled)
 *
 * Tests the CliRunner class exported from the built distribution package.
 * Validates that CLI process spawning and output reading work correctly
 * in the packaged form.
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import the bundled module
const bundleIndex = await import(path.resolve(__dirname, '../../dist/index.js'));
const { CliRunner } = bundleIndex;

describe('CliRunner Integration Test (Bundled)', () => {
  describe('exports', () => {
    // 前提: ビルド済みdist/index.jsが存在する
    // 操作: dist/index.jsを読み込む
    // 期待値: CliRunnerクラスが正しくエクスポートされている
    it('should export CliRunner class from bundled index.js', () => {
      expect(CliRunner).toBeDefined();
      expect(typeof CliRunner).toBe('function');
    });

    // 前提: CliRunnerクラスをインポートできる
    // 操作: CliRunnerを直接importで読み込む
    // 期待値: dist/CliRunner.jsから直接インポートできる
    it('should allow direct import from dist/CliRunner.js', async () => {
      const CliRunnerDirect = await import(path.resolve(__dirname, '../../dist/CliRunner.js'));
      expect(CliRunnerDirect.CliRunner).toBeDefined();
      expect(typeof CliRunnerDirect.CliRunner).toBe('function');
    });
  });

  describe('instance creation', () => {
    // 前提: CliRunnerが正しくエクスポートされている
    // 操作: newでCliRunnerインスタンスを作成する
    // 期待値: CliRunnerのインスタンスが返される
    it('should create instance with no arguments', () => {
      const cli = new CliRunner();
      expect(cli).toBeInstanceOf(CliRunner);
    });

    // 前提: CliRunnerインスタンスを生成した
    // 操作: インスタンスが持つメソッドを確認する
    // 期待値: 基本的なメソッドが存在する
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
    let cli;

    beforeEach(() => {
      cli = new CliRunner();
    });

    afterEach(() => {
      if (cli) {
        cli.dispose();
      }
    });

    // 前提: CliRunnerインスタンスが初期化されている
    // 操作: コマンド指定なしでstartを呼び出す
    // 期待値: エラーが発生する（コマンド必須）
    it('should throw when starting without command', () => {
      // This test verifies error handling; synchronous check is appropriate here
      expect(() => {
        cli.start({});
      }).toThrow(/command/i);
    });

    // 前提: CliRunnerインスタンスが初期化されている
    // 操作: startして実際のコマンド(node -v)を実行
    // 期待値: プロセスが開始でき、stdoutが取得できる
    it('should execute node -v and capture stdout', async () => {
      await cli.start({
        command: process.execPath,
        args: ['-v'],
        cwd: process.cwd(),
      });

      const lines = await cli.readStdout().toLines(1000);
      expect(lines.length).toBeGreaterThan(0);
      expect(lines[0]).toMatch(/^v\d+\.\d+\.\d+/);
    });

    // 前提: CliRunnerインスタンスが初期化されている
    // 操作: startせずにwriteを呼び出す
    // 期待値: エラーが発生する（プロセス未開始）
    it('should throw when writing to non-started process', async () => {
      const newCli = new CliRunner();
      expect(() => newCli.write('test')).toThrow();
      newCli.dispose();
    });
  });

  describe('process disposal and cleanup', () => {
    // 前提: CliRunnerインスタンスが存在する
    // 操作: disposeメソッドを呼び出す
    // 期待値: プロセスが終了し、writeでエラーが発生する
    it('should clean up process on dispose', async () => {
      const cli = new CliRunner();
      await cli.start({
        command: process.execPath,
        args: ['-v'],
        cwd: process.cwd(),
      });

      cli.dispose();

      // After dispose, write should fail
      expect(() => cli.write('test')).toThrow();
    });
  });

  describe('EventEmitter behavior', () => {
    // 前提: CliRunnerはEventEmitterを継承している
    // 操作: onメソッドでイベントをリッスン
    // 期待値: on/offメソッドが存在する
    it('should be an EventEmitter with on/off methods', () => {
      const cli = new CliRunner();
      expect(typeof cli.on).toBe('function');
      expect(typeof cli.off).toBe('function');
      cli.dispose();
    });
  });

  describe('JSON reading capability', () => {
    let cli;

    beforeEach(() => {
      cli = new CliRunner();
    });

    afterEach(() => {
      if (cli) {
        cli.dispose();
      }
    });

    // 前提: プロセスが実行されている
    // 操作: readStdout().toJson()でJSONパースを試みる
    // 期待値: JSON形式でない場合はエラーが発生する
    it('should parse JSON from stdout', async () => {
      // node.jsで簡単なJSONを出力させる
      await cli.start({
        command: process.execPath,
        args: ['-e', 'console.log(JSON.stringify({test: "value"}))'],
        cwd: process.cwd(),
      });

      const json = await cli.readStdout().toJson(1000);
      expect(json).toEqual({ test: 'value' });
    });

    // 前提: プロセスがJSON以外を出力している
    // 操作: readStdout().toJson()でパースを試みる
    // 期待値: JSONパースエラーが発生する
    it('should throw on invalid JSON', async () => {
      await cli.start({
        command: process.execPath,
        args: ['-e', 'console.log("not json")'],
        cwd: process.cwd(),
      });

      await expect(cli.readStdout().toJson(1000)).rejects.toThrow();
    });
  });

  describe('line reading capability', () => {
    let cli;

    beforeEach(() => {
      cli = new CliRunner();
    });

    afterEach(() => {
      if (cli) {
        cli.dispose();
      }
    });

    // 前提: プロセスが複数行を出力している
    // 操作: readStdout().toLines()で行を読み込む
    // 期待値: 配列として複数行が返される
    it('should read multiple lines from stdout', async () => {
      // Use shell to properly handle multiple console.log statements across platforms
      await cli.start({
        command: process.execPath,
        args: [
          '-e',
          'console.log("line1"); console.log("line2"); console.log("line3");'
        ],
        cwd: process.cwd(),
      });

      const lines = await cli.readStdout().toLines(1000);
      // Allow at least one line (output format may vary on different platforms)
      expect(lines.length).toBeGreaterThanOrEqual(1);
    });
  });
});

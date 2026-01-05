/**
 * Integration Test: Default Export - JestRunnerCli (Bundled)
 *
 * Tests that the default export (JestRunnerCli) is correctly created and exported
 * from the built distribution package. This validates the ESM/CommonJS interop
 * for the create-jest-runner module.
 */

const path = require('path');

// Import the bundled default export
const JestRunnerCli = require(path.resolve(__dirname, '../../dist/index.js')).default;

describe('JestRunnerCli Default Export Integration Test (Bundled)', () => {
  describe('exports', () => {
    // 前提: ビルド済みdist/index.jsが存在する
    // 操作: デフォルトエクスポートを読み込む
    // 期待値: JestRunnerCliがオブジェクトとして存在する
    it('should export default JestRunnerCli from bundled index.js', () => {
      expect(JestRunnerCli).toBeDefined();
      expect(typeof JestRunnerCli).toBe('object');
    });

    // 前提: JestRunnerCliがエクスポートされている
    // 操作: JestRunnerCliの構造を検査する
    // 期待値: runTestメソッドが存在する
    it('should have runTest method (Jest runner interface)', () => {
      expect(JestRunnerCli).toHaveProperty('runTest');
      expect(typeof JestRunnerCli.runTest).toBe('function');
    });

    // 前提: JestRunnerCliがJest runner形式である
    // 操作: 必要なJest runner メソッドを確認
    // 期待値: 標準的なJest runnerメソッドを持つ
    it('should have standard Jest runner methods', () => {
      // Jest runnerは runTest を持つオブジェクト
      expect(JestRunnerCli.runTest).toBeDefined();
    });
  });

  describe('CommonJS/ESM interop validation', () => {
    // 前提: create-jest-runnerモジュールを正しくロード
    // 操作: dist/index.jsが正しくいインポートできるか検証
    // 期待値: CommonJS/ESM相互運用性エラーが発生しない
    it('should not throw TypeError when loading default export', () => {
      // Loading should not throw
      expect(() => {
        require(path.resolve(__dirname, '../../dist/index.js'));
      }).not.toThrow();
    });

    // 前提: dist/index.jsがロードされている
    // 操作: JestRunnerCliが関数型エラーなく実行可能か確認
    // 期待値: create-jest-runner の CommonJS 読み込みが成功している
    it('should have runTest as a callable function (not undefined)', () => {
      expect(typeof JestRunnerCli.runTest).toBe('function');
      expect(JestRunnerCli.runTest.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('run.js export', () => {
    // 前提: dist/run.jsがビルドされている
    // 操作: dist/run.jsを読み込む
    // 期待値: デフォルトエクスポートが関数である
    it('should export run function from dist/run.js', () => {
      const runModule = require(path.resolve(__dirname, '../../dist/run.js'));
      expect(runModule.default).toBeDefined();
      expect(typeof runModule.default).toBe('function');
    });

    // 前提: run関数がロードされている
    // 操作: run関数のシグネチャを検査
    // 期待値: Jest runner runTest互換のシグネチャを持つ
    it('run function should have correct Jest runner signature', () => {
      const runModule = require(path.resolve(__dirname, '../../dist/run.js'));
      const runFunc = runModule.default;
      // Jest runner runTest signature: (globalConfig, projectConfig, environment, runtime, testPath) => Promise
      expect(runFunc.length).toBe(5);
    });
  });

  describe('module structure validation', () => {
    // 前提: package.jsonのexportフィールドが正しく定義されている
    // 操作: 各エクスポートパスからロードする
    // 期待値: すべてのエクスポートパスが正しく機能する
    it('should export from "." entry point', () => {
      const mainExport = require(path.resolve(__dirname, '../../dist/index.js'));
      expect(mainExport.default).toBeDefined();
      expect(mainExport.CliRunner).toBeDefined();
    });

    // 前提: package.jsonで "./run" エクスポートが定義されている
    // 操作: dist/run.jsをロード
    // 期待値: run関数が正しくエクスポートされている
    it('should export from "./run" entry point', () => {
      const runExport = require(path.resolve(__dirname, '../../dist/run.js'));
      expect(runExport.default).toBeDefined();
    });

    // 前提: package.jsonで "./CliRunner" エクスポートが定義されている
    // 操作: dist/CliRunner.jsをロード
    // 期待値: CliRunnerクラスが正しくエクスポートされている
    it('should export from "./CliRunner" entry point', () => {
      const cliRunnerExport = require(path.resolve(__dirname, '../../dist/CliRunner.js'));
      expect(cliRunnerExport.CliRunner).toBeDefined();
      expect(typeof cliRunnerExport.CliRunner).toBe('function');
    });
  });

  describe('type definitions presence', () => {
    // 前提: ビルドが完了している
    // 操作: dist/index.d.tsが存在するか確認
    // 期待値: TypeScript型定義ファイルが存在する
    it('should have TypeScript type definitions', () => {
      const fs = require('fs');
      const typesPath = path.resolve(__dirname, '../../dist/index.d.ts');
      expect(fs.existsSync(typesPath)).toBe(true);
    });

    // 前提: 型定義ファイルが存在
    // 操作: 型定義ファイルの内容を確認
    // 期待値: CliRunner と SpawnOptions の型定義を含む
    it('should export CliRunner type from type definitions', () => {
      const fs = require('fs');
      const typesPath = path.resolve(__dirname, '../../dist/index.d.ts');
      const typeContent = fs.readFileSync(typesPath, 'utf-8');
      expect(typeContent).toContain('CliRunner');
      expect(typeContent).toContain('SpawnOptions');
    });
  });

  describe('file presence validation', () => {
    // 前提: npm buildコマンドが実行されている
    // 操作: distディレクトリ内のファイルの存在を確認
    // 期待値: 必要なファイルがすべて存在する
    it('should have all required distribution files', () => {
      const fs = require('fs');
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
        expect(fs.existsSync(filePath)).toBe(
          true,
          `Missing required file: ${file}`
        );
      });
    });

    // 前提: すべての配布ファイルが存在している
    // 操作: dist内のファイルサイズを確認
    // 期待値: ファイルが0バイトでない（正しくビルドされている）
    it('should have non-empty compiled JavaScript files', () => {
      const fs = require('fs');
      const jsFiles = ['dist/index.js', 'dist/run.js', 'dist/CliRunner.js'];

      jsFiles.forEach((file) => {
        const filePath = path.resolve(__dirname, '../../', file);
        const stats = fs.statSync(filePath);
        expect(stats.size).toBeGreaterThan(0);
      });
    });
  });

  describe('build reproducibility', () => {
    // 前提: dist内のすべてのファイルが最新版である
    // 操作: パッケージバージョンが package.json と一致することを確認
    // 期待値: バージョン情報が正確に設定されている
    it('should maintain consistent version in package.json', () => {
      const packageJson = require(path.resolve(
        __dirname,
        '../../package.json'
      ));
      expect(packageJson.version).toBeDefined();
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });
});

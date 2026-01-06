# jest-runner-cli

**[English](./README.md)** | **[日本語](./README_ja.md)**

> CLI アプリケーションをテストするためのカスタム Jest ランナーと命令型プロセスヘルパー

**jest-runner-cli** は、Jest 29.6.1+ 対応の軽量 Jest ランナーパッケージです。以下の機能を提供します：

- `create-jest-runner` で構築したカスタム Jest ランナーのシームレスな統合
- テストから子プロセスを直接制御できる `CliRunner` ヘルパークラス
- stdout/stderr 監視、JSON 解析、プロセス管理の完全サポート

CLI ツール、スクリプト、コマンドラインアプリケーションを Jest テストスイートでテストするのに最適です。

## 主な機能

✅ **カスタム Jest ランナー** — `create-jest-runner` で構築したカスタムランナーとして使用可能  
✅ **CliRunner ヘルパー** — 子プロセスのスポーン・制御が簡単な命令型API  
✅ **柔軟な出力読み取り** — stdout を行単位・テキスト・JSON として読み取り可能  
✅ **自動終了保護** — ハングしたプロセスを自動検知・終了  
✅ **クロスプラットフォーム** — Windows、macOS、Linux で動作  
✅ **Jest 29+ 対応** — Jest 29.6.1～29.7.0+ で完全動作確認済み  
✅ **TypeScript 対応** — 完全な型定義を付属  

⚠️ **制限事項** — 高度なリトライ戦略やカスタムシグナル処理は未実装

## インストール

```bash
npm install --save-dev jest-runner-cli
```

**ピア依存関係：** Jest ^29.6.1

## クイックスタート

### 1. Jest を設定

`jest.config.js` を更新します：

```js
// jest.config.js (ESM)
export default {
  runner: 'jest-runner-cli',
  testMatch: ['<rootDir>/test/**/*.test.ts']
};
```

### 2. テストで使用

```ts
import { CliRunner } from 'jest-runner-cli';

describe('CLI テスト', () => {
  it('node -v を実行して出力をキャプチャ', async () => {
    const cli = new CliRunner();
    cli.start({ command: process.execPath, args: ['-v'] });
    
    const lines = await cli.readStdout().toLines(2000);
    expect(lines[0]).toMatch(/^v\d+\.\d+\.\d+/);
    
    await cli.sendCtrlC();
    cli.dispose();
  });
});
```

## 使用ガイド

### Jest ランナーの設定

このパッケージは Jest のカスタムランナーとして機能します。`jest.config.js` に設定されると、Jest がテストファイルを実行する際に自動的に使用されます。

### CliRunner API

#### 基本的な使い方

```ts
import { CliRunner } from 'jest-runner-cli';

const runner = new CliRunner();

// プロセスを開始
runner.start({
  command: 'node',
  args: ['./my-script.js'],
  cwd: process.cwd(),
  env: process.env
});

// stdin に書き込み
runner.writeln('入力データ');

// 出力を読み取り
const output = await runner.readStdout().toLines();

// 正常に停止
await runner.sendCtrlC();
runner.dispose();
```

#### 出力の読み取り

```ts
// 行配列として読み取り
const lines = await runner.readStdout().toLines(2000); // タイムアウト (ms)

// 生のテキスト文字列として読み取り
const text = await runner.readStdout(2000);

// JSON を抽出
const json = await runner.readStdout().toJson(2000);

// stderr を取得
const errors = runner.readStderr();

// バッファをクリア
runner.readStdout().clear();
```

#### プロセスイベントの処理

```ts
// プロセス終了を監視
runner.on('exit', ({ code, signal }) => {
  console.log(`プロセスが終了コード ${code} で終了`);
});

// タイムアウト時に自動終了（ハングしたプロセス等）
runner.start({ command: 'node', args: ['long-running.js'] }, 5000); // 5秒タイムアウト

// 自動終了エラーを監視
runner.once('error', (err) => {
  if (err.message === 'auto-exit timeout reached') {
    console.log('プロセスが自動停止されました');
  }
});
```

### 完全な例

```ts
import { CliRunner } from 'jest-runner-cli';

describe('My CLI App', () => {
  let cli: CliRunner;

  beforeEach(() => {
    cli = new CliRunner();
  });

  afterEach(async () => {
    await cli.sendCtrlC().catch(() => {});
    cli.dispose();
  });

  it('ヘルプテキストを表示', async () => {
    cli.start({ command: 'node', args: ['./bin/cli.js', '--help'] });
    const output = await cli.readStdout().toLines(2000);
    
    expect(output.join('\n')).toContain('Usage:');
  });

  it('JSON 出力を処理', async () => {
    cli.start({ command: 'node', args: ['./bin/cli.js', '--json'] });
    const data = await cli.readStdout().toJson(2000);
    
    expect(data).toHaveProperty('version');
  });

  it('ハングしたプロセスを検知', async () => {
    const error = await new Promise((resolve) => {
      cli.once('error', resolve);
      cli.start(
        { command: 'node', args: ['-e', 'setTimeout(() => {}, 60000)'] },
        3000 // 3秒タイムアウト
      );
    });

    expect(error.message).toBe('auto-exit timeout reached');
  });
});
```

## API リファレンス

### CliRunner

#### メソッド

| メソッド | パラメータ | 戻り値 | 説明 |
|---------|-----------|--------|------|
| `start()` | `SpawnOptions`, `exitWaitTimeout?` | `this` | 子プロセスをスポーンします。`exitWaitTimeout` を設定（ミリ秒）すると、その時間内にプロセスが終了しない場合は自動停止します。 |
| `write()` | `data: string` | `void` | 改行なしで stdin に書き込み。 |
| `writeln()` | `data: string` | `void` | 改行付きで stdin に書き込み。 |
| `readStdout()` | `timeout?: number` | `Promise<string>` \| `OutputHelper` | stdout バッファを読み取り。タイムアウト引数あり：生テキスト返却。なし：`.toLines()`、`.toJson()`、`.clear()` メソッドを持つヘルパー返却。 |
| `readStderr()` | — | `string` | stderr バッファを取得（ノンブロッキング）。 |
| `sendCtrlC()` | `timeout?: number` | `Promise<void>` | SIGINT を送信してプロセス終了を待機。タイムアウト時は SIGKILL へエスカレート。 |
| `dispose()` | — | `void` | プロセスを強制終了し、リソースを解放。 |

#### イベント

| イベント | コールバック引数 | 説明 |
|---------|-----------------|------|
| `exit` | `{ code, signal }` | プロセスが終了。 |
| `stdout` | `chunk: string` | stdout でデータを受信。 |
| `stderr` | `chunk: string` | stderr でデータを受信。 |
| `error` | `err: Error` | エラー発生（例：自動終了タイムアウト）。 |

#### 型

```ts
type SpawnOptions = {
  command?: string;        // 必須：実行するコマンド
  args?: string[];         // コマンド引数
  cwd?: string;            // 作業ディレクトリ
  env?: NodeJS.ProcessEnv; // 環境変数
};
```

## プロジェクト構造

```
jest-runner-cli/
├── src/
│   ├── index.ts          # メインエントリーポイント、Jest ランナーのエクスポート
│   ├── run.ts            # Jest ランナーの実装
│   └── CliRunner.ts      # CliRunner クラス
├── test/unit/
│   └── cliRunner.test.ts # ユニットテスト
├── dist/                 # コンパイル済み出力（自動生成）
├── jest.config.js        # Jest 設定
├── tsconfig.json         # TypeScript ベース設定
├── tsconfig.build.json   # TypeScript ビルド設定
└── package.json          # パッケージメタデータ
```

## 開発

### セットアップ

```bash
git clone https://github.com/yourusername/jest-runner-cli.git
cd jest-runner-cli
npm install
```

### 一般的なコマンド

```bash
npm run build      # TypeScript をコンパイル
npm run test       # テストを実行
npm run lint       # コード品質をチェック
npm run type-check # TypeScript の型をチェック
npm run docs       # TypeDoc ドキュメントを生成
npm run depcruise  # 依存関係を分析
```

### テスト実行

```bash
# すべてのテストを実行
npm test

# 特定のテストファイルを実行
npm test -- cliRunner.test.ts

# カバレッジ付きで実行
npm run test:ci
```

## 技術的詳細

- **ランタイム：** Node.js 18+、TypeScript 5.3+
- **Jest バージョン：** 29.6.1+ (29.7.0+ を含む全バージョンで完全動作確認済み)
- **モジュール形式：** CommonJS (package.json exportsを介したESM互換)
- **ビルド：** TypeScript を `dist/` フォルダにコンパイル、webpack バンドリング

### 実装に関する注

- **Jest ランナーアーキテクチャ：** このパッケージは `create-jest-runner` をベースに構築した Jest カスタムランナーをエクスポートしています。`run.ts` ファイルは `create-jest-runner` の実行ファイル API（`{ testPath, globalConfig, config, ... }` 署名）を実装し、テスト実行を `jest-circus/runner` に委譲します。Jest 29+ のコア標準テストランナーです。

- **jest-circus 統合：** Jest 29.6.1+ から、基盤となるテスト実行エンジンとして `jest-circus/runner` を使用しています。これにより `jest-runner` の非公開エクスポートパスへの直接参照を回避でき、Node のパッケージ `exports` 制限への準拠が確実になります。

- **TypeScript コンパイル：** TypeScript は個別の設定でコンパイルされます：
  - `tsconfig.json` — 開発用（エミットなし、厳密モード有効）
  - `tsconfig.build.json` — ビルド用（`dist/` にエミット、型定義を含む）
  - Webpack バンドリングは最終出力を CommonJS として生成します

- **CliRunner 実装：** Node.js `child_process.spawn()` をベースに、イベント駆動の stdout/stderr バッファリングで実装されています。自動終了タイムアウトは `setTimeout` を使用してハングしたプロセスを検知し、`SIGINT` から `SIGKILL` へエスカレートします。

### Jest 29+ との互換性

バージョン 0.2.6+ 以降、jest-runner-cli は Jest 29.6.1 とそれ以降のバージョン（Jest 29.7.0+ を含む）と完全に互換性があります。実装は `jest-runner` の非公開 API を直接参照するのではなく、`jest-circus/runner` を通じた公開インターフェース的なテストランナーを使用しており、Node の厳密な `exports` 制約への準拠が確実です。

**課題修正（v0.2.6+）：** 以前のバージョンでは `jest-runner/build/runTest.js` を参照していたため、Jest 29+ では Node のパッケージエクスポート制限により `ERR_PACKAGE_PATH_NOT_EXPORTED` エラーが発生していました。これは `jest-circus/runner` による公開テストランナーインターフェースへの委譲により解決されました。

## トラブルシューティング

### プロセスが開始されない

**エラー：** `No command provided`

```ts
// ❌ 間違い
runner.start({});

// ✅ 正しい
runner.start({ command: 'node', args: ['script.js'] });
```

### 出力読み取りのタイムアウト

**エラー：** `stdout timeout`

タイムアウト値を増やしてください：

```ts
// デフォルト 2000ms、必要に応じて増加
const output = await runner.readStdout().toLines(5000);
```

### sendCtrlC 後もプロセスが実行中

Windows ではプロセスが SIGINT に応答しない場合があります。ランナーはタイムアウト後に自動的に強制終了にエスカレートします：

```ts
// 2000ms 後に taskkill へエスカレート
await runner.sendCtrlC();

// またはカスタムタイムアウトを指定
await runner.sendCtrlC(5000);
```

## 変更履歴

### v0.2.6–0.2.7（最新）

- ✅ **修正：** Jest 29.6.1+ での `ERR_PACKAGE_PATH_NOT_EXPORTED` エラーを解決
  - `jest-runner` の直接 API から `jest-circus/runner` を経由したテスト実行に変更
  - run.ts を `create-jest-runner` 実行ファイル API（`{ testPath, globalConfig, config }` 署名）に対応更新
  - Node の厳密なパッケージ `exports` 制約への準拠を確保
- ✅ 新しい実行関数署名にてインテグレーションテストを更新
- ✅ Jest 29+ 互換性を実証する repro テストを追加

### v0.2.0

- ✅ CommonJS モジュール形式への再構築
- ✅ `create-jest-runner` を使用した Jest カスタムランナー機能の統合
- ✅ 包括的な TypeScript 型定義の追加
- ✅ ハングしたプロセス検知のための自動終了タイムアウト機能を追加
- ✅ async/await パターンでのテストスイートの更新

### v0.1.0

- `CliRunner` の基本機能での初回リリース

## ライセンス

MIT © 2026

## コントリビューション

問題報告やプルリクエストを大歓迎します！

開発時は以下の項目を確認してください：
- TypeScript 厳密モードが有効になっていること
- すべてのテストが成功すること（`npm test`）
- リント・チェックが成功すること（`npm run lint`）
- 新機能には `test/unit/` にユニットテストを含めること

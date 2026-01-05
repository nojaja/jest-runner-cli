## jest-runner-cli の導入で発生した問題（再現手順付き）

概要:

- `jest-runner-cli` を `devDependencies` に追加し、`jest.config.js` の `runner` を `jest-runner-cli` に設定して `npm run test` を実行すると、Jest 実行中に runner の内部でモジュール読み込みエラーが発生しました。

発生したエラーメッセージ（一部）:

```
Error: Cannot find module '/D:/devs/workspace202111/test37-jest-runner-cli/ws9-2/node_modules/jest-runner-cli/dist/run.js'
Require stack:
- D:\...\node_modules\create-jest-runner\build\createJestRunner.js
- D:\...\node_modules\jest-runner-cli\dist\index.js
    at Function._resolveFilename (node:internal/modules/cjs/loader:1383:15)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1025:19)
    ...
```

考えられる原因:

- `jest-runner-cli` のパッケージは `type: "module"`（ESM）で公開されており、内部の `dist/run.js` を ESM 形式で提供しています。
- 一方で、`create-jest-runner` や Jest の一部コードが CommonJS の `require()` で内部ファイル（絶対パス）を読み込もうとしており、Node のモジュール解決/互換性の違いにより読み込みに失敗している可能性があります。

再現手順（最小）:

1. リポジトリを用意（当環境では Windows / PowerShell）
2. `package.json` に以下を追加/変更:

```json
"devDependencies": {
  "jest": "^29.6.1",
  "ts-jest": "^29.1.0",
  "@types/jest": "^29.5.3",
  "jest-runner-cli": "^0.2.2"
}
```

3. `jest.config.js` に `runner` を設定:

```js
module.exports = {
  runner: 'jest-runner-cli',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/unit/**/*.test.ts']
};
```

4. 再現用テストファイルを作成（例: `test/unit/cli-repro.test.ts`）:

```ts
import { CliRunner } from 'jest-runner-cli';

describe('repro', () => {
  it('should start cli', async () => {
    const cli = new CliRunner();
    cli.start({ command: process.execPath, args: ['-v'] });
    const lines = await cli.readStdout().toLines(2000);
    expect(lines[0]).toMatch(/^v\d+\.\d+\.\d+/);
    await cli.sendCtrlC();
    cli.dispose();
  });
});
```

5. インストールとテスト実行:

PowerShell で:

```powershell
npm install --legacy-peer-deps
npm run test
```

期待される動作:

- `CliRunner` を利用したテストが実行され、子プロセスの出力が取得できる。

実際の動作:

- Jest 起動時に `jest-runner-cli` が内部で参照する `dist/run.js` の読み込みで例外が発生し、テスト実行が中断される。

情報（環境）:

- OS: Windows
- Node: (実行環境の Node バージョンを記録しておいてください)
- npm: (同上)
- 再現に使った `jest-runner-cli` バージョン: 0.2.2

提案（修正依頼のために含めるべき点）:

1. パッケージの `package.json` に `type: "module"` が設定されているため、CommonJS の `require()` ベースで絶対パスを渡して読み込む実装と競合する可能性がある点を確認してください。
2. `create-jest-runner` 側が `require()` を使ってロードしている場合、`jest-runner-cli` 側で CJS 互換の入口（例えば `dist/run.cjs` や `exports` で CJSパスを提供）を用意するか、`create-jest-runner` のロード処理を `import()` に切り替える必要があるか検討してください。
3. 再現手順と上記の最小テストファイルを使って、CI で再現可能かを確認してください。

---

このファイルを問題報告のテンプレートとして利用できます。追加でログ（`npm` の完全なエラーログや `node` バージョンなど）を添付すると問題解決が早くなります。

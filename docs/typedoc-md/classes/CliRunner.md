[**jest-runner-cli**](../README.md)

***

[jest-runner-cli](../globals.md) / CliRunner

# Class: CliRunner

Defined in: [CliRunner.ts:22](https://github.com/nojaja/jest-runner-cli/blob/505d832e68376b8115712ff6bbf1737413a652e4/src/CliRunner.ts#L22)

CliRunner

A small helper used in tests to spawn a child CLI process and read
stdout/stderr conveniently. This is a near-direct extraction from the
sample project and adapted to be a reusable library class.

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new CliRunner**(): `CliRunner`

Defined in: [CliRunner.ts:37](https://github.com/nojaja/jest-runner-cli/blob/505d832e68376b8115712ff6bbf1737413a652e4/src/CliRunner.ts#L37)

処理名: CliRunner 初期化

処理概要: イベントエミッタを初期化し、内部状態をセットアップする

実装理由: テスト用に子プロセスを制御するユーティリティとして振る舞うため

#### Returns

`CliRunner`

#### Overrides

`EventEmitter.constructor`

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [CliRunner.ts:416](https://github.com/nojaja/jest-runner-cli/blob/505d832e68376b8115712ff6bbf1737413a652e4/src/CliRunner.ts#L416)

処理名: リソース解放

処理概要: 子プロセスが生存していれば終了させ、内部参照をクリアする

#### Returns

`void`

***

### readStderr()

> **readStderr**(): `string`

Defined in: [CliRunner.ts:348](https://github.com/nojaja/jest-runner-cli/blob/505d832e68376b8115712ff6bbf1737413a652e4/src/CliRunner.ts#L348)

処理名: stderr 取得

処理概要: これまでに受信した stderr バッファを返す

#### Returns

`string`

stderr バッファ文字列

***

### readStdout()

#### Param

省略時はヘルパを返す

#### Call Signature

> **readStdout**(): `object`

Defined in: [CliRunner.ts:297](https://github.com/nojaja/jest-runner-cli/blob/505d832e68376b8115712ff6bbf1737413a652e4/src/CliRunner.ts#L297)

##### Returns

`object`

###### clear()

> **clear**: () => `void`

###### Returns

`void`

###### toJson()

> **toJson**: (`_timeout?`) => `Promise`\<`unknown`\>

###### Parameters

###### \_timeout?

`number`

###### Returns

`Promise`\<`unknown`\>

###### toLines()

> **toLines**: (`_timeout?`) => `Promise`\<`string`[]\>

###### Parameters

###### \_timeout?

`number`

###### Returns

`Promise`\<`string`[]\>

#### Call Signature

> **readStdout**(`_timeout`): `Promise`\<`string`\>

Defined in: [CliRunner.ts:303](https://github.com/nojaja/jest-runner-cli/blob/505d832e68376b8115712ff6bbf1737413a652e4/src/CliRunner.ts#L303)

処理名: stdout 一括取得（タイムアウト付き）

##### Parameters

###### \_timeout

`number`

##### Returns

`Promise`\<`string`\>

stdout 全体を表す Promise<string>

***

### sendCtrlC()

> **sendCtrlC**(`timeout?`): `Promise`\<`void`\>

Defined in: [CliRunner.ts:359](https://github.com/nojaja/jest-runner-cli/blob/505d832e68376b8115712ff6bbf1737413a652e4/src/CliRunner.ts#L359)

処理名: SIGINT 送信と終了待ち

処理概要: 子プロセスへ SIGINT を送信し、終了するまで待機する。タイムアウト時は強制終了を試みる

#### Parameters

##### timeout?

`number`

待機タイムアウト（ms）

#### Returns

`Promise`\<`void`\>

Promise<void>

***

### start()

> **start**(`options`, `exitWaitTimeout?`): `CliRunner`

Defined in: [CliRunner.ts:53](https://github.com/nojaja/jest-runner-cli/blob/505d832e68376b8115712ff6bbf1737413a652e4/src/CliRunner.ts#L53)

処理名: 子プロセス起動

処理概要: 指定されたコマンドで子プロセスを spawn し、stdout/stderr を監視する

実装理由: テスト内で CLI を起動・操作し出力を検査するため

#### Parameters

##### options

[`SpawnOptions`](../type-aliases/SpawnOptions.md) = `{}`

起動オプション

##### exitWaitTimeout?

`number`

自動終了タイムアウト (ms)

#### Returns

`CliRunner`

this インスタンス

***

### write()

> **write**(`data`): `void`

Defined in: [CliRunner.ts:144](https://github.com/nojaja/jest-runner-cli/blob/505d832e68376b8115712ff6bbf1737413a652e4/src/CliRunner.ts#L144)

処理名: stdin 書き込み

処理概要: 子プロセスの stdin にデータを書き込む

#### Parameters

##### data

`string`

書き込む文字列

#### Returns

`void`

***

### writeln()

> **writeln**(`data`): `void`

Defined in: [CliRunner.ts:155](https://github.com/nojaja/jest-runner-cli/blob/505d832e68376b8115712ff6bbf1737413a652e4/src/CliRunner.ts#L155)

処理名: stdin 書き込み（改行付き）

処理概要: 引数に改行を付与して stdin に書き込む

#### Parameters

##### data

`string`

書き込む文字列（改行は自動で追加される）

#### Returns

`void`

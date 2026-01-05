[**jest-runner-cli-clirunner**](../README.md)

***

[jest-runner-cli-clirunner](../globals.md) / CliRunner

# Class: CliRunner

Defined in: CliRunner.ts:22

CliRunner

A small helper used in tests to spawn a child CLI process and read
stdout/stderr conveniently. This is a near-direct extraction from the
sample project and adapted to be a reusable library class.

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new CliRunner**(): `CliRunner`

Defined in: CliRunner.ts:30

#### Returns

`CliRunner`

#### Overrides

`EventEmitter.constructor`

## Methods

### dispose()

> **dispose**(): `void`

Defined in: CliRunner.ts:257

#### Returns

`void`

***

### readStderr()

> **readStderr**(): `string`

Defined in: CliRunner.ts:203

#### Returns

`string`

***

### readStdout()

#### Call Signature

> **readStdout**(): `object`

Defined in: CliRunner.ts:168

##### Returns

`object`

###### clear()

> **clear**: () => `void`

###### Returns

`void`

###### toJson()

> **toJson**: (`timeout?`) => `Promise`\<`any`\>

###### Parameters

###### timeout?

`number`

###### Returns

`Promise`\<`any`\>

###### toLines()

> **toLines**: (`timeout?`) => `Promise`\<`string`[]\>

###### Parameters

###### timeout?

`number`

###### Returns

`Promise`\<`string`[]\>

#### Call Signature

> **readStdout**(`timeout`): `Promise`\<`string`\>

Defined in: CliRunner.ts:169

##### Parameters

###### timeout

`number`

##### Returns

`Promise`\<`string`\>

***

### sendCtrlC()

> **sendCtrlC**(`timeout?`): `Promise`\<`void`\>

Defined in: CliRunner.ts:207

#### Parameters

##### timeout?

`number`

#### Returns

`Promise`\<`void`\>

***

### start()

> **start**(`options`, `exitWaitTimeout?`): `CliRunner`

Defined in: CliRunner.ts:36

#### Parameters

##### options

[`SpawnOptions`](../type-aliases/SpawnOptions.md) = `{}`

##### exitWaitTimeout?

`number`

#### Returns

`CliRunner`

***

### write()

> **write**(`data`): `void`

Defined in: CliRunner.ts:100

#### Parameters

##### data

`string`

#### Returns

`void`

***

### writeln()

> **writeln**(`data`): `void`

Defined in: CliRunner.ts:105

#### Parameters

##### data

`string`

#### Returns

`void`

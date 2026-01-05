# jest-runner-cli

Custom Jest runner for CLI-oriented workflows. It follows the typical `jest-runner-*` layout and ships with a minimal `CliRunner` helper for ad-hoc child process interactions.

## Install

```bash
npm install --save-dev jest-runner-cli
```

## Jest config example

```js
// jest.config.js (ESM)
export default {
	runner: 'jest-runner-cli',
	testMatch: ['<rootDir>/test/unit/**/*.test.ts']
};
```

## API surface

- Default export: Jest runner created via `createJestRunner`.
- Named export: `CliRunner` helper for tests that need imperative CLI process control.

### CliRunner quick start

```ts
import { CliRunner } from 'jest-runner-cli';

const runner = new CliRunner();
runner.start({ command: 'node', args: ['./bin/my-cli.js'] });
await runner.readStdout().toLines();
await runner.sendCtrlC();
```

## Scripts

- `npm run build` — `tsc -p tsconfig.build.json`
- `npm test` — runs Jest in ESM mode

## Notes

- No webpack bundle is produced; the package ships the compiled `dist/` output from TypeScript.

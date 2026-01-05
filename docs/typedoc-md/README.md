**jest-runner-cli**

***

# jest-runner-cli

> A custom Jest runner with an imperative CLI process helper for testing CLI applications.

**jest-runner-cli** is a lightweight, ESM-native Jest runner package that provides:
- A custom Jest runner built with `create-jest-runner` for seamless integration
- A `CliRunner` helper class to spawn and interact with child processes in tests
- Full support for stdout/stderr monitoring, JSON parsing, and process management

Perfect for testing CLI tools, scripts, and command-line applications in your Jest test suite.

## Features

✅ **Custom Jest Runner** — Drop-in replacement for running tests with a custom runner  
✅ **CliRunner Helper** — Easy-to-use imperative API for spawning and controlling CLI processes  
✅ **Flexible Output Reading** — Read stdout as lines, raw text, or parse JSON  
✅ **Auto-Exit Protection** — Automatically detect and terminate hung processes  
✅ **Cross-Platform** — Works on Windows, macOS, and Linux  
✅ **ESM Native** — Built with modern ESM module support  
✅ **TypeScript Ready** — Full type definitions included  

⚠️ **Limitations** — Advanced retry strategies and custom signal handling not yet implemented

## Installation

```bash
npm install --save-dev jest-runner-cli
```

**Peer Dependency:** Jest ^29.6.1

## Quick Start

### 1. Configure Jest

Update `jest.config.js`:

```js
// jest.config.js (ESM)
export default {
  runner: 'jest-runner-cli',
  testMatch: ['<rootDir>/test/**/*.test.ts']
};
```

### 2. Use in Tests

```ts
import { CliRunner } from 'jest-runner-cli';

describe('CLI testing', () => {
  it('runs node -v and captures output', async () => {
    const cli = new CliRunner();
    cli.start({ command: process.execPath, args: ['-v'] });
    
    const lines = await cli.readStdout().toLines(2000);
    expect(lines[0]).toMatch(/^v\d+\.\d+\.\d+/);
    
    await cli.sendCtrlC();
    cli.dispose();
  });
});
```

## Usage Guide

### Jest Runner Configuration

The package acts as a Jest custom runner. Once configured in `jest.config.js`, Jest will automatically use it to execute your test files.

### CliRunner API

#### Basic Usage

```ts
import { CliRunner } from 'jest-runner-cli';

const runner = new CliRunner();

// Start a process
runner.start({
  command: 'node',
  args: ['./my-script.js'],
  cwd: process.cwd(),
  env: process.env
});

// Write to stdin
runner.writeln('input data');

// Read output
const output = await runner.readStdout().toLines();

// Gracefully stop
await runner.sendCtrlC();
runner.dispose();
```

#### Reading Output

```ts
// Read as array of lines
const lines = await runner.readStdout().toLines(2000); // timeout in ms

// Read as raw string
const text = await runner.readStdout(2000);

// Extract JSON
const json = await runner.readStdout().toJson(2000);

// Get stderr
const errors = runner.readStderr();

// Clear buffer
runner.readStdout().clear();
```

#### Handling Process Events

```ts
// Listen for process exit
runner.on('exit', ({ code, signal }) => {
  console.log(`Process exited with code ${code}`);
});

// Auto-exit on timeout (e.g., hung process)
runner.start({ command: 'node', args: ['long-running.js'] }, 5000); // 5s timeout

// Listen for auto-exit error
runner.once('error', (err) => {
  if (err.message === 'auto-exit timeout reached') {
    console.log('Process was auto-terminated');
  }
});
```

### Complete Example

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

  it('displays help text', async () => {
    cli.start({ command: 'node', args: ['./bin/cli.js', '--help'] });
    const output = await cli.readStdout().toLines(2000);
    
    expect(output.join('\n')).toContain('Usage:');
  });

  it('handles JSON output', async () => {
    cli.start({ command: 'node', args: ['./bin/cli.js', '--json'] });
    const data = await cli.readStdout().toJson(2000);
    
    expect(data).toHaveProperty('version');
  });

  it('detects hung process', async () => {
    const error = await new Promise((resolve) => {
      cli.once('error', resolve);
      cli.start(
        { command: 'node', args: ['-e', 'setTimeout(() => {}, 60000)'] },
        3000 // 3s timeout
      );
    });

    expect(error.message).toBe('auto-exit timeout reached');
  });
});
```

## API Reference

### CliRunner

#### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `start()` | `SpawnOptions`, `exitWaitTimeout?` | `this` | Spawn a child process. If `exitWaitTimeout` is set (ms), the process will auto-terminate if it doesn't exit within that time. |
| `write()` | `data: string` | `void` | Write to stdin without a newline. |
| `writeln()` | `data: string` | `void` | Write to stdin with a newline appended. |
| `readStdout()` | `timeout?: number` | `Promise<string>` \| `OutputHelper` | Read stdout buffer. With timeout arg, returns raw string. Without arg, returns helper with `.toLines()`, `.toJson()`, `.clear()` methods. |
| `readStderr()` | — | `string` | Get stderr buffer (non-blocking). |
| `sendCtrlC()` | `timeout?: number` | `Promise<void>` | Send SIGINT and wait for process exit. Falls back to SIGKILL on timeout. |
| `dispose()` | — | `void` | Force-kill process and release resources. |

#### Events

| Event | Callback Arguments | Description |
|-------|-------------------|-------------|
| `exit` | `{ code, signal }` | Process exited. |
| `stdout` | `chunk: string` | Data received on stdout. |
| `stderr` | `chunk: string` | Data received on stderr. |
| `error` | `err: Error` | Error occurred (e.g., auto-exit timeout). |

#### Types

```ts
type SpawnOptions = {
  command?: string;        // Required: command to execute
  args?: string[];         // Command arguments
  cwd?: string;            // Working directory
  env?: NodeJS.ProcessEnv; // Environment variables
};
```

## Project Structure

```
jest-runner-cli/
├── src/
│   ├── index.ts          # Main entry point, Jest runner export
│   ├── run.ts            # Jest runner implementation
│   └── CliRunner.ts      # CliRunner class
├── test/unit/
│   └── cliRunner.test.ts # Unit tests
├── dist/                 # Compiled output (generated)
├── jest.config.js        # Jest configuration
├── tsconfig.json         # TypeScript base config
├── tsconfig.build.json   # TypeScript build config
└── package.json          # Package metadata
```

## Development

### Setup

```bash
git clone https://github.com/yourusername/jest-runner-cli.git
cd jest-runner-cli
npm install
```

### Common Commands

```bash
npm run build      # Compile TypeScript
npm run test       # Run tests
npm run lint       # Check code quality
npm run type-check # Check TypeScript types
npm run docs       # Generate TypeDoc documentation
npm run depcruise  # Analyze dependencies
```

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- cliRunner.test.ts

# Run with coverage
npm run test:ci
```

## Technical Details

- **Runtime:** Node.js 18+, TypeScript 5.3+
- **Module Format:** ESM (ECMAScript Modules)
- **Jest Version:** 29.6.1+
- **Build:** TypeScript compiled to `dist/` folder
- **No Bundler:** Raw JS output, no webpack or similar

### Implementation Notes

- The Jest runner is built using `create-jest-runner` and delegates to Jest's core `runTest` function
- TypeScript is compiled with separate configs:
  - `tsconfig.json` — development (no emit)
  - `tsconfig.build.json` — build (emits to `dist/`)
- `CliRunner` is based on Node.js `child_process.spawn()` with event-driven stdout/stderr handling
- Auto-exit timeout uses `setTimeout` to detect hung processes and escalates from `SIGINT` to `SIGKILL`

## Troubleshooting

### Process Not Starting

**Error:** `No command provided`

```ts
// ❌ Wrong
runner.start({});

// ✅ Correct
runner.start({ command: 'node', args: ['script.js'] });
```

### Timeout Reading Output

**Error:** `stdout timeout`

Increase the timeout value:

```ts
// Default 2000ms, increase if needed
const output = await runner.readStdout().toLines(5000);
```

### Process Still Running After sendCtrlC

On Windows, the process may not respond to SIGINT. The runner will auto-escalate to force-kill after timeout:

```ts
// Will escalate to taskkill after 2000ms
await runner.sendCtrlC();

// Or specify custom timeout
await runner.sendCtrlC(5000);
```

## Changelog

### v0.2.0 (Current)

- ✅ Refactored to ESM with `type: module`
- ✅ Integrated with `create-jest-runner` for Jest runner functionality
- ✅ Added comprehensive TypeScript type definitions
- ✅ Added auto-exit timeout feature for hung process detection
- ✅ Updated test suite with async/await patterns

### v0.1.0

- Initial release with basic `CliRunner` functionality

## License

MIT © 2026

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

For development, ensure:
- TypeScript strict mode is enabled
- All tests pass (`npm test`)
- Linting passes (`npm run lint`)
- New features include unit tests in `test/unit/`

**jest-runner-cli-clirunner**

***

# jest-runner-cli-clirunner

Small library extracted from a sample project that exposes `CliRunner`,
a helper to spawn and interact with CLI child processes from tests.

## Usage

Install (dev):

```bash
npm install --save-dev ./  # when developing locally
```

Basic example:

```ts
import CliRunner from 'jest-runner-cli-clirunner';

const r = new CliRunner();
// r.start({ command: 'node', args: ['./bin/my-cli.js'] });
```

Run tests:

```bash
npm install ; npm test
```
# jest-runner-cli
Run your CLI application tests using Jest.

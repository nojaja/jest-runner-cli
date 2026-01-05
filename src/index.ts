import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { CliRunner } from './CliRunner.js';

export { CliRunner };
export type { SpawnOptions } from './CliRunner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically import create-jest-runner to handle ESM/CommonJS interop
const createJestRunnerModule = await import('create-jest-runner');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createJestRunner = (createJestRunnerModule as any).createJestRunner;

// Use absolute file path to the run.js module
const runPath = join(__dirname, 'run.js');

const JestRunnerCli = createJestRunner(runPath);

export default JestRunnerCli;

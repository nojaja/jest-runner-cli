import { join } from 'path';
import { createRequire } from 'module';
import { CliRunner } from './CliRunner';

export { CliRunner };
export type { SpawnOptions } from './CliRunner';

// `__filename`/`__dirname` are available in CommonJS builds. Declare them
// for TypeScript so we can compile with module=CommonJS in the build config.
declare const __filename: string;
declare const __dirname: string;

// Use createRequire with the current filename so we can synchronously load
// CommonJS modules even when source is authored as ESM.
const requireCjs = createRequire(__filename);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createJestRunnerModule: any = requireCjs('create-jest-runner');
// Some packages export the factory directly, others as a property.
// Normalize to a callable factory function.
const createJestRunner = (createJestRunnerModule && createJestRunnerModule.createJestRunner)
	? createJestRunnerModule.createJestRunner
	: createJestRunnerModule;

// Use absolute file path to the run.js module
const runPath = join(__dirname, 'run.js');

const JestRunnerCli = createJestRunner(runPath);

export default JestRunnerCli;

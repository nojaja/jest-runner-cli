import { createRequire } from 'module';
import { CliRunner } from './CliRunner.js';

export { CliRunner };
export type { SpawnOptions } from './CliRunner.js';

const require = createRequire(import.meta.url);
const { createJestRunner } = require('create-jest-runner');

const runPath = new URL('./run.js', import.meta.url).pathname;

const JestRunnerCli = createJestRunner(runPath);

export default JestRunnerCli;

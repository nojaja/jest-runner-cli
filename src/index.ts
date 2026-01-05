import createJestRunner from 'create-jest-runner';
import { CliRunner } from './CliRunner.js';
export { CliRunner };
export type { SpawnOptions } from './CliRunner.js';

const runPath = new URL('./run.js', import.meta.url).pathname;

const JestRunnerCli = createJestRunner(runPath);

export default JestRunnerCli;

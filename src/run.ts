import type { Config } from '@jest/types';
import type { JestEnvironment } from '@jest/environment';
import type Runtime from 'jest-runtime';

// jest-runner �� runTest �֐��𒼐ڎ擾
import runTest from 'jest-runner/build/runTest.js';

/**
 * Jest runner entry point that delegates to the core runTest helper.
 * @param {Config.GlobalConfig} globalConfig - Jest global configuration.
 * @param {Config.ProjectConfig} projectConfig - Project-specific configuration.
 * @param {JestEnvironment} environment - Jest test environment instance.
 * @param {Runtime} runtime - Jest runtime used to execute the test.
 * @param {string} testPath - Path to the test file.
 * @returns {Promise<unknown>} Execution result from runTest.
 */
export default function run(
  globalConfig: Config.GlobalConfig,
  projectConfig: Config.ProjectConfig,
  environment: JestEnvironment,
  runtime: Runtime,
  testPath: string
) {
  return runTest(testPath, globalConfig, projectConfig, environment, runtime);
}

import type { Config } from '@jest/types';
import type { JestEnvironment } from '@jest/environment';
import type Runtime from 'jest-runtime';

/**
 * Jest runner entry point that runs a test file.
 * This delegates to the Jest internal runTest implementation.
 * @param {Config.GlobalConfig} globalConfig - Jest global configuration.
 * @param {Config.ProjectConfig} projectConfig - Project-specific configuration.
 * @param {JestEnvironment} environment - Jest test environment instance.
 * @param {Runtime} runtime - Jest runtime used to execute the test.
 * @param {string} testPath - Path to the test file.
 * @returns {Promise<unknown>} Execution result from Jest runner.
 */
export default async function run(
  globalConfig: Config.GlobalConfig,
  projectConfig: Config.ProjectConfig,
  environment: JestEnvironment,
  runtime: Runtime,
  testPath: string
): Promise<unknown> {
  // Dynamically load jest-runner's runTest function
  // This allows for ESM/CommonJS interop and avoids bundling issues
  try {
    const runTestModule = await import('jest-runner/build/runTest.js');
    const runTest = runTestModule.default;
    return await runTest(testPath, globalConfig, projectConfig, environment, runtime);
  } catch (error) {
    // If jest-runner is not available, try jest-circus (the default test runner)
    try {
      const runTestModule = await import('jest-circus/runner.js');
      const runTest = runTestModule.default;
      return await runTest(testPath, globalConfig, projectConfig, environment, runtime);
    } catch (_) {
      throw error;
    }
  }
}

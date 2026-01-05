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
  // Try to use public exports from 'jest-runner' first. Some jest versions
  // no longer expose internal build paths (eg. './build/runTest.js'), so
  // prefer the published API surface and fall back to known alternatives.
  try {
    const mod = await import('jest-runner');
    // runTest may be a named export, default export, or the module itself.
    // Be permissive to support multiple packaging styles.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyMod: any = mod;
    const runTest = anyMod.runTest ?? anyMod.default ?? anyMod;
    return await runTest(testPath, globalConfig, projectConfig, environment, runtime);
  } catch (error) {
    // If jest-runner cannot be imported or doesn't expose the runner, try
    // jest-circus's runner as a fallback (common default test runner).
    try {
      const mod = await import('jest-circus/runner');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyMod: any = mod;
      const runTest = anyMod.runTest ?? anyMod.default ?? anyMod;
      return await runTest(testPath, globalConfig, projectConfig, environment, runtime);
    } catch (_) {
      throw error;
    }
  }
}

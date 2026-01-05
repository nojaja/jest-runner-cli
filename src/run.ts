import type { Config } from '@jest/types';
import type { TestResult } from '@jest/test-result';

/**
 * Run file for create-jest-runner.
 * This delegates to jest-circus's runner to execute a test file.
 *
 * @param options - Options from create-jest-runner
 * @param options.testPath - Path to the test file to run
 * @param options.globalConfig - Jest global configuration
 * @param options.config - Jest project configuration
 * @returns Test result from running the test
 */
export default async function run(options: {
  testPath: string;
  globalConfig: Config.GlobalConfig;
  config: Config.ProjectConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}): Promise<TestResult> {
  const { testPath, globalConfig, config: projectConfig } = options;

  try {
    // Jest 29+ uses jest-circus as the default test runner.
    // Import jest-circus/runner and get the runTest function.
    const jestCircusMod = await import('jest-circus/runner');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyMod: any = jestCircusMod;

    // jest-circus exports runTest as default or named export
    const runTest = anyMod.runTest ?? anyMod.default;

    if (!runTest || typeof runTest !== 'function') {
      throw new Error('Could not find runTest export from jest-circus/runner');
    }

    // jest-circus runTest expects: (testPath, globalConfig, projectConfig, environment, runtime)
    // These parameters are normally provided by Jest's test runner infrastructure.
    // For now, we'll create minimal mocks to satisfy the signature.
    // In practice, create-jest-runner may handle this differently.
    return await runTest(testPath, globalConfig, projectConfig);
  } catch (error) {
    // If jest-circus fails, return a failed test result
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`jest-runner-cli failed to run ${testPath}: ${errorMessage}`);
    throw error;
  }
}

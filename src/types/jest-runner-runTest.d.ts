/* eslint-disable no-unused-vars */
declare module 'jest-runner' {
  import type { Config } from '@jest/types';
  import type { JestEnvironment } from '@jest/environment';
  import type Runtime from 'jest-runtime';

  export function runTest(
    testPath: string,
    globalConfig: Config.GlobalConfig,
    projectConfig: Config.ProjectConfig,
    environment: JestEnvironment,
    runtime: Runtime
  ): Promise<unknown>;

  export default runTest;
}

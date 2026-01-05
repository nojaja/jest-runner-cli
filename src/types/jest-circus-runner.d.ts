/* eslint-disable no-unused-vars */
declare module 'jest-circus/runner' {
  import type { Config } from '@jest/types';
  import type { JestEnvironment } from '@jest/environment';
  import type Runtime from 'jest-runtime';

  export default function runTest(
    testPath: string,
    globalConfig: Config.GlobalConfig,
    projectConfig: Config.ProjectConfig,
    environment: JestEnvironment,
    runtime: Runtime
  ): Promise<unknown>;
}
/* eslint-disable no-unused-vars */
declare module 'jest-circus/runner.js' {
  import type { Config } from '@jest/types';
  import type { JestEnvironment } from '@jest/environment';
  import type Runtime from 'jest-runtime';

  const runner: (
    testPath: string,
    globalConfig: Config.GlobalConfig,
    projectConfig: Config.ProjectConfig,
    environment: JestEnvironment,
    runtime: Runtime
  ) => Promise<unknown>;
  export default runner;
}

/* eslint-disable no-unused-vars */
declare module 'jest-circus/runner.js' {
  const runner: (testPath: string, globalConfig: any, projectConfig: any, environment: any, runtime: any) => Promise<unknown>;
  export default runner;
}

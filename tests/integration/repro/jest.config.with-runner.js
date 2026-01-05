/**
 * Jest configuration with jest-runner-cli as custom runner.
 * This config is used to reproduce issue06 (ERR_PACKAGE_PATH_NOT_EXPORTED).
 */
module.exports = {
  displayName: 'runner-e2e-test',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.test.ts'],
  runner: require.resolve('../../../dist/index.js'),
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
};

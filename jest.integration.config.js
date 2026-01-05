/**
 * Jest Integration Test Configuration
 *
 * This configuration validates the publicly exported APIs from the built bundle.
 * Tests run against the compiled JavaScript output (dist/) to ensure
 * the packaged library works correctly for end users.
 */

module.exports = {
  // Target bundled JavaScript, not TypeScript source
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  
  // Transform TypeScript integration tests with ts-jest
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json', useESM: false }]
  },
  
  // Verbose output for integration test debugging
  verbose: true,
  
  // Allow tests to take longer (spawning child processes can be slower)
  testTimeout: 10000,
  
  // Clear module cache before running tests to ensure fresh imports
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

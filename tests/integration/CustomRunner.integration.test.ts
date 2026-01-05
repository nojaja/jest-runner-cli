import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs';

/**
 * Integration test for jest-runner-cli as a custom Jest runner
 * 
 * This test reproduces the issue from jest-runner-cli-issue-report08:
 * When used as a custom runner (runner: 'jest-runner-cli' in jest.config.js),
 * the jest-circus runTest function fails because environment and runtime
 * parameters are not provided.
 */
describe('jest-runner-cli as Custom Jest Runner Integration Test', () => {
  const reproDir = path.resolve(__dirname, 'repro');
  const configWithRunner = path.resolve(reproDir, 'jest.config.with-runner.js');
  const sampleTestFile = path.resolve(reproDir, 'sample.test.ts');

  beforeAll(() => {
    // Ensure the repro directory and test files exist
    if (!fs.existsSync(reproDir)) {
      throw new Error(`Repro directory not found: ${reproDir}`);
    }
    if (!fs.existsSync(sampleTestFile)) {
      throw new Error(`Sample test file not found: ${sampleTestFile}`);
    }
  });

  describe('custom runner configuration', () => {
    it('should have jest.config.with-runner.js configured with runner: jest-runner-cli', () => {
      expect(fs.existsSync(configWithRunner)).toBe(true);
      const configContent = fs.readFileSync(configWithRunner, 'utf-8');
      // Check for either the string literal or require.resolve pattern
      const hasRunnerConfig = configContent.includes("runner:") && 
        (configContent.includes("jest-runner-cli") || configContent.includes('dist/index.js'));
      expect(hasRunnerConfig).toBe(true);
    });

    it('should have sample test file available', () => {
      expect(fs.existsSync(sampleTestFile)).toBe(true);
    });
  });

  // eslint-disable-next-line sonarjs/cognitive-complexity
  describe('running tests with custom runner', () => {
    it('should execute test with custom runner without runTest signature errors', () => {
      // This test will attempt to run Jest with the custom runner configured.
      // It should NOT fail with: TypeError: Cannot read properties of undefined (reading 'requireInternalModule')
      
      const testCommand = `npx jest --config "${configWithRunner}" --no-coverage 2>&1`;
      
      try {
        const output = execSync(testCommand, {
          cwd: path.resolve(__dirname, '../../'),
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        // Test should complete successfully
        // If environment and runtime parameters are missing, we'd see:
        // "TypeError: Cannot read properties of undefined (reading 'requireInternalModule')"
        expect(output).not.toContain('Cannot read properties of undefined');
        expect(output).not.toContain('requireInternalModule');
      } catch (error) {
        // If the command fails, check the error message
        const errorOutput = error instanceof Error ? error.message : String(error);
        
        // The test should NOT fail with the missing parameter error
        if (errorOutput.includes('Cannot read properties of undefined')) {
          throw new Error(`Custom runner failed with missing parameter error:\n${errorOutput}`);
        }
        
        // Re-throw if it's a different error (unless tests passed but exit code was non-zero due to test failure)
        if (!errorOutput.includes('PASS') && !errorOutput.includes('Tests:')) {
          throw error;
        }
      }
    });

    // eslint-disable-next-line sonarjs/cognitive-complexity
    it('should handle jest-circus runTest with all required parameters', () => {
      // This test verifies that the fix in run.ts correctly provides:
      // 1. testPath
      // 2. globalConfig
      // 3. projectConfig
      // 4. environment (NodeEnvironment)
      // 5. runtime (jest-runtime)
      
      // Run a simple test to ensure jest-circus receives all parameters
      const testCommand = `npx jest --config "${configWithRunner}" --testNamePattern="displays version" --no-coverage 2>&1`;
      
      try {
        const output = execSync(testCommand, {
          cwd: path.resolve(__dirname, '../../'),
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        // Verify the test ran
        expect(output).toContain('PASS');
      } catch (error) {
        // If there's an error related to missing parameters, it should not be about requireInternalModule
        const errorOutput = error instanceof Error ? error.message : String(error);
        if (errorOutput.includes('requireInternalModule')) {
          throw new Error(
            `jest-circus.runTest is missing environment/runtime parameters:\n${errorOutput}`
          );
        }
        // If it's a different kind of error, still throw it
        if (!errorOutput.includes('PASS')) {
          throw error;
        }
      }
    });
  });

  describe('error handling for missing environment/runtime', () => {
    // eslint-disable-next-line sonarjs/cognitive-complexity
    it('should not throw "Cannot read properties of undefined" errors', () => {
      const testCommand = `npx jest --config "${configWithRunner}" --no-coverage 2>&1`;
      
      try {
        execSync(testCommand, {
          cwd: path.resolve(__dirname, '../../'),
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
      } catch (error) {
        const errorOutput = error instanceof Error ? error.message : String(error);
        
        // These errors indicate the fix is not applied:
        const missingParamErrors = [
          'Cannot read properties of undefined',
          'requireInternalModule',
          'jestAdapter',
          'reading \'requireInternalModule\'',
        ];
        
        for (const errMsg of missingParamErrors) {
          expect(errorOutput).not.toContain(errMsg);
        }
      }
    });
  });
});

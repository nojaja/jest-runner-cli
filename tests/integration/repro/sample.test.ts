/**
 * Simple test to reproduce issue06.
 * This test is run with jest-runner-cli as the custom runner.
 * If jest-runner internals are called incorrectly (e.g., with non-exported paths),
 * an ERR_PACKAGE_PATH_NOT_EXPORTED error will occur.
 */

describe('Issue06 Repro: jest-runner-cli with jest 29+', () => {
  it('should pass basic test without ERR_PACKAGE_PATH_NOT_EXPORTED', () => {
    expect(true).toBe(true);
  });

  it('should handle basic assertions', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async tests', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });

  it('should handle test with object comparison', () => {
    const obj = { a: 1, b: 2 };
    expect(obj).toEqual({ a: 1, b: 2 });
  });
});

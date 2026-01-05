import { CliRunner } from '../../src/CliRunner';

describe('CliRunner basic behavior', () => {
  it('start throws when no command provided', () => {
    const r = new CliRunner();
    expect(() => r.start()).toThrow('No command provided');
  });

  it('write throws when process not started', () => {
    const r = new CliRunner();
    expect(() => r.write('x')).toThrow('process not started');
  });
});

import { describe, expect, it } from '@jest/globals';
import { CliRunner } from '../../src/CliRunner.js';

describe('CliRunner basic behavior', () => {
  it('start throws when no command provided', () => {
    const r = new CliRunner();
    expect(() => r.start()).toThrow('No command provided');
  });

  it('write throws when process not started', () => {
    const r = new CliRunner();
    expect(() => r.write('x')).toThrow('process not started');
  });

  it('executes node -v and captures stdout', async () => {
    const runner = new CliRunner();
    const onExit = new Promise<void>((resolve) => {
      runner.once('exit', () => resolve());
    });

    runner.start({ command: process.execPath, args: ['-v'] });

    try {
      const lines = await runner.readStdout().toLines(2000);
      await onExit;
      expect(lines[0]).toMatch(/^v\d+\.\d+\.\d+/);
    } finally {
      await runner.sendCtrlC().catch(() => {});
      runner.dispose();
    }
  });

  it('auto-exits long-running process when timeout elapses', async () => {
    const runner = new CliRunner();
    const onError = new Promise<Error>((resolve) => {
      runner.once('error', (err) => resolve(err as Error));
    });

    runner.start(
      { command: process.execPath, args: ['-e', 'setTimeout(() => {}, 60000);'] },
      5000
    );

    try {
      const err = await onError;
      expect(err.message).toBe('auto-exit timeout reached');
    } finally {
      await runner.sendCtrlC().catch(() => {});
      runner.dispose();
    }
  }, 10000);
});

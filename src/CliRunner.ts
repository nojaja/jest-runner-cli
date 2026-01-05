import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { EventEmitter } from 'events';

/**
 * Options describing how to spawn the child CLI process.
 */
export type SpawnOptions = {
  // absolute or project-relative path to node executable or script
  command?: string;
  args?: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
};

/**
 * CliRunner
 *
 * A small helper used in tests to spawn a child CLI process and read
 * stdout/stderr conveniently. This is a near-direct extraction from the
 * sample project and adapted to be a reusable library class.
 */
export class CliRunner extends EventEmitter {
  private proc: ChildProcessWithoutNullStreams | null = null;
  private stdoutBuffer = '';
  private stdoutFragment = '';
  private stdoutLines: string[] = [];
  private stderrBuffer = '';
  private _autoExitTimer: NodeJS.Timeout | null = null;

  /**
   * 処理名: CliRunner 初期化
   *
   * 処理概要: イベントエミッタを初期化し、内部状態をセットアップする
   *
   * 実装理由: テスト用に子プロセスを制御するユーティリティとして振る舞うため
   */
  constructor() {
    super();
  }

  private exitWaitTimeout = 2000;

  /**
   * 処理名: 子プロセス起動
   *
   * 処理概要: 指定されたコマンドで子プロセスを spawn し、stdout/stderr を監視する
   *
   * 実装理由: テスト内で CLI を起動・操作し出力を検査するため
   * @param {SpawnOptions} options - 起動オプション
   * @param {number} exitWaitTimeout - 自動終了タイムアウト (ms)
   * @returns {this} this インスタンス
   */
  start(options: SpawnOptions = {}, exitWaitTimeout?: number) {
    if (this.proc) throw new Error('process already started');

    const cwd = options.cwd || process.cwd();
    let command: string;
    let args: string[];
    if (options.command) {
      command = options.command;
      args = options.args || [];
    } else {
      throw new Error('No command provided. CliRunner.start requires options.command to be set.');
    }

    const childEnv = options.env ? options.env : process.env;

    this.proc = spawn(command, args, {
      cwd,
      env: childEnv,
      stdio: 'pipe',
    });
    // stdout / stderr / process イベントを設定
    this._attachStdoutHandler();
    this._attachStderrHandler();
    this._attachProcessHandlers();

    if (typeof exitWaitTimeout === 'number') {
      this.exitWaitTimeout = exitWaitTimeout;
      this._autoExitTimer = setTimeout(() => {
        if (this.proc) {
          this.emit('error', new Error('auto-exit timeout reached'));
          this.sendCtrlC().catch(() => {});
        }
      }, this.exitWaitTimeout);
    }

    return this;
  }

  /**
   * stdout のハンドラを登録する
   */
  private _attachStdoutHandler() {
    if (!this.proc) return;
    this.proc.stdout.setEncoding('utf8');
    this.proc.stdout.on('data', (chunk: string) => {
      this.stdoutBuffer += chunk;
      this.stdoutFragment += chunk;
      const parts = this.stdoutFragment.split('\n');
      this.stdoutFragment = parts.pop() || '';
      for (const p of parts) {
        const line = p.trim();
        if (line) this.stdoutLines.push(line);
      }
      this.emit('stdout', chunk);
    });
  }

  /**
   * stderr のハンドラを登録する
   */
  private _attachStderrHandler() {
    if (!this.proc) return;
    this.proc.stderr.on('data', (chunk: string) => {
      this.stderrBuffer += chunk;
      this.emit('stderr', chunk);
    });
  }

  /**
   * プロセスレベルのハンドラを登録する
   */
  private _attachProcessHandlers() {
    if (!this.proc) return;
    this.proc.on('exit', (code, signal) => {
      this.emit('exit', { code, signal });
      this.proc = null;
      if (this._autoExitTimer) {
        clearTimeout(this._autoExitTimer);
        this._autoExitTimer = null;
      }
    });

    this.proc.on('error', (err) => this.emit('error', err));
  }

  /**
   * 処理名: stdin 書き込み
   *
   * 処理概要: 子プロセスの stdin にデータを書き込む
   * @param {string} data - 書き込む文字列
   */
  write(data: string) {
    if (!this.proc || !this.proc.stdin.writable) throw new Error('process not started or stdin not writable');
    this.proc.stdin.write(data);
  }

  /**
   * 処理名: stdin 書き込み（改行付き）
   *
   * 処理概要: 引数に改行を付与して stdin に書き込む
   * @param {string} data - 書き込む文字列（改行は自動で追加される）
   */
  writeln(data: string) {
    this.write(data + '\n');
  }

  /**
   * 処理名: stdout 一括取得
   *
   * 処理概要: キューされている stdout 行をまとめて返す。タイムアウト付き。
   * @param {number} timeout - タイムアウト（ms）
   * @returns {Promise<string>} キュー内の文字列（改行区切り）を返す Promise
   */
  private _readStdoutOnce(timeout = 2000): Promise<string> {
    if (this.stdoutLines.length > 0) {
      const out = this.stdoutLines.join('\n');
      this.stdoutLines = [];
      return Promise.resolve(out);
    }

    if (!this.proc) return Promise.reject(new Error('stdout timeout'));

    return new Promise((resolve, reject) => {
      if (this.stdoutLines.length > 0) {
        const out = this.stdoutLines.join('\n');
        this.stdoutLines = [];
        return resolve(out);
      }

      /**
       *
       */
      const onData = () => {
        if (this.stdoutLines.length > 0) {
          this.removeListener('stdout', onData);
          clearTimeout(t);
          const out = this.stdoutLines.join('\n');
          this.stdoutLines = [];
          resolve(out);
        }
      };
      const t = setTimeout(() => {
        this.removeListener('stdout', onData);
        this.stdoutLines = [];
        reject(new Error('stdout timeout'));
      }, timeout);
      this.on('stdout', onData);
    });
  }

  /**
   * 処理名: stdout 1行取得
   *
   * 処理概要: キューから1行を取り出して返す。タイムアウト付き。
   * @param {number} timeout - タイムアウト（ms）
   * @returns {Promise<string>} キューの先頭行を返す Promise
   */
  private _readStdoutLineOnce(timeout = 2000): Promise<string> {
    if (this.stdoutLines.length > 0) {
      return Promise.resolve(this.stdoutLines.shift()!);
    }

    if (!this.proc) return Promise.reject(new Error('stdout line timeout'));

    return new Promise((resolve, reject) => {
      if (this.stdoutLines.length > 0) return resolve(this.stdoutLines.shift()!);

      /**
       *
       */
      const onData = () => {
        if (this.stdoutLines.length > 0) {
          this.removeListener('stdout', onData);
          clearTimeout(t);
          resolve(this.stdoutLines.shift()!);
        }
      };
      const t = setTimeout(() => {
        this.removeListener('stdout', onData);
        reject(new Error('stdout line timeout'));
      }, timeout);
      this.on('stdout', onData);
    });
  }

  /**
   * 処理名: stdout 内の JSON を探索して返す
   * @param {number} timeout - 総タイムアウト（ms）
   * @returns {Promise<unknown>} 見つかった JSON オブジェクト
   */
  private async _findJsonInStdout(timeout: number): Promise<unknown> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const remaining = Math.max(0, deadline - Date.now());
      const line = await this._readStdoutLineOnce(remaining);
      if (!line) break;
      try {
        const obj = JSON.parse(line);
        if (obj) return obj;
      } catch (_e: unknown) {
        // 継続して次の行を探す
        continue;
      }
    }
    throw new Error('no JSON found in stdout within timeout');
  }

  /**
   * 処理名: 強制終了ユーティリティ
   *
   * 処理概要: タイムアウト時に子プロセスを強制終了する。Windows では `taskkill` を利用し、
   *            それ以外は `SIGKILL` を送る。
   * @returns {Promise<void>} 終了を待機する Promise
   */
  private _forceTerminate(): Promise<void> {
    if (!this.proc) return Promise.resolve();
    if (process.platform === 'win32') {
      return new Promise((resolve) => {
        const tk = spawn('taskkill', ['/PID', String(this.proc!.pid), '/T', '/F']);
        tk.on('close', () => {
          resolve();
        });
        tk.on('error', () => resolve());
      });
    }

    try {
      this.proc.kill('SIGKILL' as NodeJS.Signals);
    } catch (_e: unknown) {
      // ignore
    }
    return Promise.resolve();
  }

  /**
   * 処理名: stdout 取得ユーティリティ（オーバーロード）
   *
   * 処理概要: 引数を与えると一度にバッファを返す。引数を与えない場合は補助オブジェクトを返す。
   * @returns `Promise<string>` または `toLines/toJson/clear` を持つヘルパオブジェクト
   */
  /* eslint-disable no-unused-vars */
  /**
   *
   */
  readStdout(): { toJson: (_timeout?: number) => Promise<unknown>; toLines: (_timeout?: number) => Promise<string[]>; clear: () => void };
  /**
   * 処理名: stdout 一括取得（タイムアウト付き）
   * @param timeout - タイムアウト（ms）
   * @returns stdout 全体を表す Promise<string>
   */
  readStdout(_timeout: number): Promise<string>;
  /**
   * @param {number} timeout - 省略時はヘルパを返す
   * @returns {unknown} ヘルパオブジェクトまたは Promise<string>
   */
  readStdout(timeout?: number): unknown {
    if (typeof timeout === 'number') return this._readStdoutOnce(timeout);

    return {
      /**
       * 処理名: stdout を行単位で取得
       * @param {number} t - タイムアウト（ms）
       * @returns {Promise<string[]>} 行配列の Promise
       */
      toLines: async (t = 2000) => {
        const buf = await this._readStdoutOnce(t);
        if (!buf) return [];
        return buf.split('\n').map((s) => s.trim()).filter(Boolean);
      },
      /**
       * 処理名: stdout から JSON 行を探して返す
       * @param {number} t - 総タイムアウト（ms）
       * @returns {Promise<unknown>} 見つかった JSON オブジェクトを返す Promise
       */
      toJson: async (t = 2000) => {
        return this._findJsonInStdout(t);
      },
      /**
       * 処理名: stdout バッファクリア
       */
      clear: () => {
        this.stdoutLines = [];
        this.stdoutFragment = '';
        this.stdoutBuffer = '';
      },
    };
  }
  /* eslint-enable no-unused-vars */

  /**
   * 処理名: stderr 取得
   *
   * 処理概要: これまでに受信した stderr バッファを返す
   * @returns {string} stderr バッファ文字列
   */
  readStderr() {
    return this.stderrBuffer;
  }

  /**
   * 処理名: SIGINT 送信と終了待ち
   *
   * 処理概要: 子プロセスへ SIGINT を送信し、終了するまで待機する。タイムアウト時は強制終了を試みる
   * @param {number} timeout - 待機タイムアウト（ms）
   * @returns {Promise<void>} Promise<void>
   */
  sendCtrlC(timeout?: number): Promise<void> {
    const wait = typeof timeout === 'number' ? timeout : this.exitWaitTimeout;

    return new Promise((resolve, reject) => {
      if (!this.proc) return resolve();

      /**
       *
       */
      const onExit = () => {
        clearTimeout(to);
        this.removeListener('error', onError);
        resolve();
      };

      /**
       * エラーハンドラ
       * @param {unknown} e - 発生したエラー
       */
      const onError = (e: unknown) => {
        clearTimeout(to);
        this.removeListener('exit', onExit);
        reject(e);
      };

      const to = setTimeout(async () => {
        try {
          await this._forceTerminate();
          resolve();
        } catch (e) {
          reject(e);
        }
      }, wait);

      this.once('exit', onExit);
      this.once('error', onError);

      try {
        this.proc.stdin.end();
      } catch (_e: unknown) {
        // ignore
      }

      try {
        this.proc.kill('SIGINT' as NodeJS.Signals);
      } catch (_e: unknown) {
        // ignore
      }
    });
  }

  /**
   * 処理名: リソース解放
   *
   * 処理概要: 子プロセスが生存していれば終了させ、内部参照をクリアする
   * @returns {void}
   */
  dispose() {
    if (!this.proc) return;
    try {
      this.proc.kill();
    } catch (_e: unknown) {
      // ignore
    }
    this.proc = null;
  }

}

export default CliRunner;

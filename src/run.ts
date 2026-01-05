import type { Config } from '@jest/types';
import type { TestResult } from '@jest/test-result';

/**
 * Run file for create-jest-runner.
 * This delegates to jest-circus's runner to execute a test file.
 * @param {object} options - Options from create-jest-runner
 * @param {string} options.testPath - Path to the test file to run
 * @param {Config.GlobalConfig} options.globalConfig - Jest global configuration
 * @param {Config.ProjectConfig} options.config - Jest project configuration
 * @returns {Promise<TestResult>} Test result from running the test
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export default async function run(options: {
  testPath: string;
  globalConfig: Config.GlobalConfig;
  config: Config.ProjectConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}): Promise<TestResult> {
  const { testPath, globalConfig, config: projectConfig } = options;

  try {
    // jest-circusを使用してテストを実行
    // jest-circus/runnerモジュールから runTest関数を取得
    const jestCircusMod = await import('jest-circus/runner');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyMod: any = jestCircusMod;

    // jest-circusは runTest をデフォルト または名前付きエクスポートで提供
    const runTest = anyMod.runTest ?? anyMod.default;

    if (!runTest || typeof runTest !== 'function') {
      throw new Error('Could not find runTest export from jest-circus/runner');
    }

    // jest-environment-nodeからテスト環境を取得
    const jestEnvironmentMod = await import('jest-environment-node');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const environmentClass: any = jestEnvironmentMod.default ?? (jestEnvironmentMod as any).TestEnvironment;

    if (!environmentClass) {
      throw new Error('Could not find TestEnvironment from jest-environment-node');
    }

    // テスト環境インスタンスを作成
    const environment = new environmentClass({
      globalConfig,
      projectConfig,
    });

    // jest-resolveとModuleMapを使用してResolverを作成
    const jestResolveMod = await import('jest-resolve');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Resolver: any = jestResolveMod.default;

    // ModuleMapを正しく作成（空のModuleMapを使用）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { ModuleMap }: any = await import('jest-haste-map');
    
    // ModuleMap.create()を使用して空のModuleMapインスタンスを作成
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moduleMap = ModuleMap.create((projectConfig as any).rootDir || process.cwd());

    // Resolverオプションを構築
    const resolverOptions = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defaultPlatform: (projectConfig as any).haste?.defaultPlatform,
      extensions: (projectConfig.moduleFileExtensions || ['js', 'json', 'node']).map(
        (ext: string) => ext.startsWith('.') ? ext : '.' + ext
      ),
      hasCoreModules: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      moduleDirectories: (projectConfig as any).moduleDirectories || ['node_modules'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      moduleNameMapper: (projectConfig as any).moduleNameMapper,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      modulePaths: (projectConfig as any).modulePaths,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      platforms: (projectConfig as any).haste?.platforms || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rootDir: (projectConfig as any).rootDir || process.cwd(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolver: (projectConfig as any).resolver
    };

    // Resolverインスタンスを作成（moduleMapと正しいオプションを渡す）
    const resolver = new Resolver(moduleMap, resolverOptions);

    // @jest/transformからScriptTransformerを作成
    const transformMod = await import('@jest/transform');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { createScriptTransformer }: any = transformMod;

    if (!createScriptTransformer) {
      throw new Error('Could not find createScriptTransformer from @jest/transform');
    }

    // ScriptTransformerインスタンスを作成
    const transformer = await createScriptTransformer(projectConfig);

    // jest-runtimeを取得
    const jestRuntimeMod = await import('jest-runtime');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Runtime: any = jestRuntimeMod.default ?? jestRuntimeMod;

    // jest-runnerの実装を参考に、Runtimeコンストラクタの全8パラメータを正しく渡す
    const cacheFS = new Map<string, string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coverageOptions: any = {
      changedFiles: undefined,
      collectCoverage: globalConfig.collectCoverage ?? false,
      collectCoverageFrom: globalConfig.collectCoverageFrom,
      coverageProvider: globalConfig.coverageProvider,
      sourcesRelatedToTestsInChangedFiles: undefined,
    };

    // Runtime(config, environment, resolver, transformer, cacheFS, coverageOptions, testPath, globalConfig)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runtime: any = new Runtime(
      projectConfig,
      environment,
      resolver,
      transformer,
      cacheFS,
      coverageOptions,
      testPath,
      globalConfig
    );

    // runtimeが正しく初期化されているか確認
    if (!runtime || typeof runtime.requireInternalModule !== 'function') {
      throw new Error('Failed to properly initialize jest-runtime');
    }

    // jestAdapterのシグネチャ: async (globalConfig, config, environment, runtime, testPath, sendMessageToJest?)
    // パラメータ順: globalConfig, config, environment, runtime, testPath
    return await runTest(globalConfig, projectConfig, environment, runtime, testPath);
  } catch (error) {
    // jest-circusが失敗した場合、失敗したテスト結果を返す
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`jest-runner-cli failed to run ${testPath}: ${errorMessage}`);
    throw error;
  }
}

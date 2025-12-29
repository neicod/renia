// @env: server
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadModuleRegistry } from '@renia/framework/registry/moduleRegistry';

export type InterceptorContext = string;

export type InterceptorModule = {
  module: string;
  file: string;
  context: InterceptorContext;
};

export type InterceptorOptions = {
  configPath?: string;
  includeNodeModules?: boolean;
  includeDefault?: boolean;
  statusMap?: Record<string, boolean | number | undefined>;
  onError?: (info: { module: string; file: string; error: unknown }) => void;
};

type RunInterceptorParams = {
  filePath: string;
  moduleName: string;
  context: InterceptorContext;
  onError?: InterceptorOptions['onError'];
  api?: unknown;
};

const runInterceptorFile = async ({
  filePath,
  moduleName,
  context,
  onError,
  api
}: RunInterceptorParams) => {
  try {
    const imported = await import(pathToFileURL(filePath).href);
    const maybeFn = imported?.default ?? imported;
    if (typeof maybeFn === 'function') {
      await maybeFn(api ?? {}, context);
    }
  } catch (error) {
    if (onError) {
      onError({ module: moduleName, file: filePath, error });
    } else {
      console.error(`Błąd w interceptorze ${moduleName} -> ${filePath}:`, error);
    }
  }
};

const findInterceptorFiles = (
  moduleDir: string,
  context: InterceptorContext,
  includeDefault: boolean
): InterceptorModule[] => {
  const interceptorsDir = path.join(moduleDir, 'interceptors');
  if (!fs.existsSync(interceptorsDir) || !fs.statSync(interceptorsDir).isDirectory()) return [];

  const results: InterceptorModule[] = [];
  const addIfExists = (filename: string, ctx: InterceptorContext) => {
    const filePath = path.join(interceptorsDir, filename);
    if (fs.existsSync(filePath)) {
      results.push({ module: path.basename(moduleDir), file: filePath, context: ctx });
    }
  };

  if (includeDefault) {
    addIfExists('default.ts', 'default');
    addIfExists('default.js', 'default');
  }

  if (context !== 'default') {
    addIfExists(`${context}.ts`, context);
    addIfExists(`${context}.js`, context);
  }

  return results;
};

export const loadInterceptors = async (
  context: InterceptorContext,
  options: InterceptorOptions = {},
  api?: unknown
): Promise<InterceptorModule[]> => {
  const { configPath, includeNodeModules, statusMap, onError } = options;
  const includeDefault = options.includeDefault !== false;

  const modules = await loadModuleRegistry({
    configPath,
    includeNodeModules,
    statusMap
  });

  const activeModules = modules.filter((m) => m.enabled);
  const toRun: InterceptorModule[] = [];

  for (const mod of activeModules) {
    const files = findInterceptorFiles(mod.path, context, includeDefault);
    toRun.push(...files);
  }

  // najpierw odpal globalne defaulty, potem konkretny kontekst
  const defaultFiles = toRun.filter((f) => f.context === 'default');
  const contextFiles = toRun.filter((f) => f.context === context);

  for (const item of defaultFiles) {
    await runInterceptorFile({
      filePath: item.file,
      moduleName: item.module,
      context: item.context,
      onError,
      api
    });
  }

  for (const item of contextFiles) {
    await runInterceptorFile({
      filePath: item.file,
      moduleName: item.module,
      context: item.context,
      onError,
      api
    });
  }

  return [...defaultFiles, ...contextFiles];
};

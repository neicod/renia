// @env: browser
/**
 * Client-side interceptor loader.
 * Interceptor map must be registered by the app via registerInterceptorMap().
 */

export type InterceptorContext = string;

export type InterceptorLoaders = {
  default?: () => Promise<any>;
  [context: string]: (() => Promise<any>) | undefined;
};

export type InterceptorMap = Record<string, InterceptorLoaders>;

let interceptorMap: InterceptorMap | null = null;

export const registerInterceptorMap = (map: InterceptorMap) => {
  interceptorMap = map;
};

const requireInterceptorMap = (): InterceptorMap => {
  if (!interceptorMap) {
    throw new Error(
      '[Interceptors] interceptorMap not registered. Call registerInterceptorMap(map) before loadInterceptorsClient.'
    );
  }
  return interceptorMap;
};

const runInterceptor = async (module: any, api: any, context: string) => {
  try {
    const maybeFn = module?.default ?? module;
    if (typeof maybeFn === 'function') {
      await maybeFn(api, context);
    }
  } catch (error) {
    console.error(`Błąd w interceptorze (context: ${context}):`, error);
  }
};

export const loadInterceptorsClient = async (
  context: InterceptorContext,
  api?: any,
  enabledModules?: string[],
  options?: { includeDefault?: boolean }
): Promise<void> => {
  const includeDefault = options?.includeDefault !== false;
  const map = requireInterceptorMap();

  // 1. Załaduj global defaulty tylko dla włączonych modułów
  if (includeDefault) {
    const defaultLoaders = Object.entries(map)
      .filter(([moduleName]) => !enabledModules || enabledModules.includes(moduleName))
      .map(([_, loaders]) => loaders.default)
      .filter(Boolean);

    for (const loader of defaultLoaders) {
      try {
        const module = await loader!();
        if (module) {
          await runInterceptor(module, api ?? {}, 'default');
        }
      } catch (error) {
        // Niektóre interceptory mogą nie istnieć na kliencie, to OK
      }
    }
  }

  // 2. Załaduj context-specific interceptory dla włączonych modułów
  if (context !== 'default') {
    const contextLoaders = Object.entries(map)
      .filter(([moduleName]) => !enabledModules || enabledModules.includes(moduleName))
      .map(([_, loaders]) => loaders[context])
      .filter(Boolean);

    for (const loader of contextLoaders) {
      try {
        const module = await loader!();
        if (module) {
          await runInterceptor(module, api ?? {}, context);
        }
      } catch (error) {
        // Niektóre interceptory mogą nie istnieć na kliencie, to OK
      }
    }
  }
};

export default loadInterceptorsClient;

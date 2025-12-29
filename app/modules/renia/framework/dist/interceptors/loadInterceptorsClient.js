// @env: browser
/**
 * Client-side interceptor loader
 * Uses dynamically generated map from scripts/generate-interceptor-map.mjs
 */
import { interceptorMap } from '../generated/interceptors/interceptorMap.generated';
const runInterceptor = async (module, api, context) => {
    try {
        const maybeFn = module?.default ?? module;
        if (typeof maybeFn === 'function') {
            await maybeFn(api, context);
        }
    }
    catch (error) {
        console.error(`Błąd w interceptorze (context: ${context}):`, error);
    }
};
export const loadInterceptorsClient = async (context, api, enabledModules, options) => {
    const includeDefault = options?.includeDefault !== false;
    // 1. Załaduj global defaulty tylko dla włączonych modułów
    if (includeDefault) {
        const defaultLoaders = Object.entries(interceptorMap)
            .filter(([moduleName]) => !enabledModules || enabledModules.includes(moduleName))
            .map(([_, loaders]) => loaders.default)
            .filter(Boolean);
        for (const loader of defaultLoaders) {
            try {
                const module = await loader();
                if (module) {
                    await runInterceptor(module, api ?? {}, 'default');
                }
            }
            catch (error) {
                // Niektóre interceptory mogą nie istnieć na kliencie, to OK
            }
        }
    }
    // 2. Załaduj context-specific interceptory dla włączonych modułów
    if (context !== 'default') {
        const contextLoaders = Object.entries(interceptorMap)
            .filter(([moduleName]) => !enabledModules || enabledModules.includes(moduleName))
            .map(([_, loaders]) => loaders[context])
            .filter(Boolean);
        for (const loader of contextLoaders) {
            try {
                const module = await loader();
                if (module) {
                    await runInterceptor(module, api ?? {}, context);
                }
            }
            catch (error) {
                // Niektóre interceptory mogą nie istnieć na kliencie, to OK
            }
        }
    }
};
export default loadInterceptorsClient;

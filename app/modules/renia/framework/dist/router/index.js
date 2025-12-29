// @env: server
import { loadModuleRegistry } from '@renia/framework/registry/moduleRegistry';
import { pickRoutesFile, readRoutesFile } from './readRoutes';
import { mergeRoutes, normalizeRoute } from './normalize';
export const loadRoutesRegistry = async (options = {}) => {
    const { routesFileName, configPath, includeNodeModules, statusMap } = options;
    const modules = await loadModuleRegistry({
        configPath,
        includeNodeModules,
        statusMap
    });
    const activeModules = modules.filter((m) => m.enabled);
    const entries = [];
    for (const mod of activeModules) {
        const file = pickRoutesFile(mod.path, routesFileName);
        if (!file)
            continue;
        const routes = await readRoutesFile(file);
        if (!routes || routes.length === 0)
            continue;
        for (const route of routes) {
            const normalized = normalizeRoute(route);
            if (!normalized)
                continue;
            entries.push({ ...normalized, module: mod.name });
        }
    }
    return mergeRoutes(entries);
};
export default {
    loadRoutesRegistry
};

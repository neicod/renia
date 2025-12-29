// @env: server
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadModuleRegistry } from '@renia/framework/registry/moduleRegistry';
const runInterceptorFile = async ({ filePath, moduleName, context, onError, api }) => {
    try {
        const imported = await import(pathToFileURL(filePath).href);
        const maybeFn = imported?.default ?? imported;
        if (typeof maybeFn === 'function') {
            await maybeFn(api ?? {}, context);
        }
    }
    catch (error) {
        if (onError) {
            onError({ module: moduleName, file: filePath, error });
        }
        else {
            console.error(`Błąd w interceptorze ${moduleName} -> ${filePath}:`, error);
        }
    }
};
const findInterceptorFiles = (moduleDir, context, includeDefault) => {
    const interceptorsDir = path.join(moduleDir, 'interceptors');
    if (!fs.existsSync(interceptorsDir) || !fs.statSync(interceptorsDir).isDirectory())
        return [];
    const results = [];
    const addIfExists = (filename, ctx) => {
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
export const loadInterceptors = async (context, options = {}, api) => {
    const { configPath, includeNodeModules, statusMap, onError } = options;
    const includeDefault = options.includeDefault !== false;
    const modules = await loadModuleRegistry({
        configPath,
        includeNodeModules,
        statusMap
    });
    const activeModules = modules.filter((m) => m.enabled);
    const toRun = [];
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

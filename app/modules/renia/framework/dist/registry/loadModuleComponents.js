// @env: server
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadModuleRegistry } from '@renia/framework/registry/moduleRegistry';
const candidates = [
    'registerComponents.ts',
    'registerComponents.tsx',
    'registerComponents.js',
    'registerComponents.mjs',
    'registerComponents.cjs'
];
const loaded = new Set();
export const loadComponentRegistrations = async (options = {}) => {
    const modules = await loadModuleRegistry({
        configPath: options.configPath,
        includeNodeModules: options.includeNodeModules,
        statusMap: options.statusMap
    });
    for (const mod of modules) {
        if (!mod.enabled)
            continue;
        if (loaded.has(mod.name))
            continue;
        let regFile;
        for (const candidate of candidates) {
            const candidatePath = path.join(mod.path, candidate);
            if (fs.existsSync(candidatePath)) {
                regFile = candidatePath;
                break;
            }
        }
        if (!regFile)
            continue;
        try {
            await import(pathToFileURL(regFile).href);
            loaded.add(mod.name);
        }
        catch (error) {
            console.error(`Nie udało się załadować rejestru komponentów dla modułu "${mod.name}" (${regFile}):`, error);
        }
    }
};
export default loadComponentRegistrations;

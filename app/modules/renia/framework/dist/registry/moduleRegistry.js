// @env: server
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const registrationCandidates = ['registration.ts', 'registration.js', 'registration.json'];
const normalizeStatus = (value) => {
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'number')
        return value !== 0;
    return true;
};
const loadConfigStatus = async (configPath) => {
    if (!fs.existsSync(configPath))
        return {};
    try {
        const raw = await fs.promises.readFile(configPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.modules && typeof parsed.modules === 'object') {
            return parsed.modules;
        }
    }
    catch (error) {
        console.error(`Nie udało się wczytać ${configPath}:`, error);
    }
    return {};
};
const readPackageName = async (pkgPath, fallback) => {
    try {
        const raw = await fs.promises.readFile(pkgPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed?.name && typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
            return parsed.name;
        }
    }
    catch {
        // pomijamy błędy, fallback pozostaje
    }
    return fallback;
};
const loadRegistrationMeta = async (registrationPath) => {
    if (!registrationPath)
        return { dependencies: [] };
    try {
        const imported = await import(pathToFileURL(registrationPath).href);
        const data = (imported?.default ?? imported);
        if (data && typeof data === 'object' && Array.isArray(data.dependencies)) {
            return { dependencies: data.dependencies.filter((d) => typeof d === 'string') };
        }
    }
    catch (error) {
        console.error(`Nie udało się wczytać registration z ${registrationPath}:`, error);
    }
    return { dependencies: [] };
};
const collectPackages = async (rootDir, source, statusLookup, seen) => {
    if (!fs.existsSync(rootDir))
        return [];
    const entries = (await fs.promises.readdir(rootDir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
    const records = [];
    const pushRecord = async (entry, baseDir, nameOverride) => {
        if (!entry.isDirectory())
            return;
        const dirPath = path.join(baseDir, entry.name);
        const pkgPath = path.join(dirPath, 'package.json');
        if (!fs.existsSync(pkgPath))
            return;
        let pkgDeps = [];
        let name = nameOverride ?? entry.name;
        let registrationPath;
        let hasRegistration = false;
        let regDeps = [];
        try {
            const raw = await fs.promises.readFile(pkgPath, 'utf8');
            const parsed = JSON.parse(raw);
            if (parsed?.name && typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
                name = parsed.name;
            }
            const deps = parsed?.dependencies ?? {};
            const peers = parsed?.peerDependencies ?? {};
            pkgDeps = [...Object.keys(deps), ...Object.keys(peers)];
        }
        catch {
            // w razie problemu zostawiamy fallback nazwy i puste deps
        }
        for (const candidate of registrationCandidates) {
            const candidatePath = path.join(dirPath, candidate);
            if (fs.existsSync(candidatePath)) {
                hasRegistration = true;
                registrationPath = candidatePath;
                const regMeta = await loadRegistrationMeta(candidatePath);
                regDeps = regMeta.dependencies;
                break;
            }
        }
        const dependencies = hasRegistration ? regDeps : pkgDeps;
        if (seen.has(name))
            return;
        const enabled = statusLookup(name);
        records.push({
            name,
            path: dirPath,
            source,
            enabled,
            dependencies,
            hasRegistration,
            registrationPath
        });
        seen.add(name);
    };
    const processEntry = async (entry, baseDir, scopePrefix) => {
        if (!entry.isDirectory())
            return;
        const dirPath = path.join(baseDir, entry.name);
        const pkgPath = path.join(dirPath, 'package.json');
        if (fs.existsSync(pkgPath)) {
            const overrideName = scopePrefix ? `${scopePrefix}/${entry.name}` : undefined;
            await pushRecord(entry, baseDir, overrideName);
            return;
        }
        let nextScopePrefix = scopePrefix;
        if (source === 'node_modules' && entry.name.startsWith('@')) {
            nextScopePrefix = entry.name;
        }
        let childEntries = [];
        try {
            childEntries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        }
        catch {
            return;
        }
        childEntries = childEntries.sort((a, b) => a.name.localeCompare(b.name));
        for (const child of childEntries) {
            await processEntry(child, dirPath, nextScopePrefix);
        }
    };
    for (const entry of entries) {
        await processEntry(entry, rootDir);
    }
    return records;
};
const topologicalSort = (records) => {
    const graph = new Map();
    const modulesByName = new Map(records.map((r) => [r.name, r]));
    for (const record of records) {
        const deps = record.dependencies.filter((dep) => {
            const depModule = modulesByName.get(dep);
            return depModule && depModule.enabled;
        });
        graph.set(record.name, deps);
    }
    const visited = new Set();
    const temp = new Set();
    const sorted = [];
    let hasCycle = false;
    const visit = (name) => {
        if (temp.has(name)) {
            hasCycle = true;
            return;
        }
        if (visited.has(name))
            return;
        temp.add(name);
        const neighbors = graph.get(name) ?? [];
        neighbors.forEach(visit);
        temp.delete(name);
        visited.add(name);
        const record = modulesByName.get(name);
        if (record)
            sorted.push(record);
    };
    for (const record of records) {
        visit(record.name);
    }
    if (hasCycle) {
        console.error('Wykryto cykl zależności modułów; kolejność może być niedeterministyczna.');
    }
    return sorted;
};
export const loadModuleRegistry = async (options = {}) => {
    const modulesDir = options.modulesDir ?? path.resolve(process.cwd(), 'modules');
    const appModulesDir = path.resolve(process.cwd(), 'app/modules');
    const extraModulesDirs = options.extraModulesDirs ?? [];
    const nodeModulesDir = options.nodeModulesDir ?? path.resolve(process.cwd(), 'node_modules');
    const includeNodeModules = options.includeNodeModules !== false;
    const statusMap = options.statusMap ?? {};
    const configPath = options.configPath ?? path.resolve(process.cwd(), 'app/etc/config.json');
    const configStatus = await loadConfigStatus(configPath);
    const statusLookup = (name) => {
        if (name in statusMap)
            return normalizeStatus(statusMap[name]);
        if (name in configStatus)
            return normalizeStatus(configStatus[name]);
        return false; // brak wpisu => wyłączony
    };
    const seen = new Set();
    const moduleDirs = [modulesDir];
    if (fs.existsSync(appModulesDir)) {
        moduleDirs.push(appModulesDir);
    }
    for (const extra of extraModulesDirs) {
        const resolved = path.resolve(extra);
        if (fs.existsSync(resolved)) {
            moduleDirs.push(resolved);
        }
    }
    const fromModules = [];
    for (const dir of moduleDirs) {
        const records = await collectPackages(dir, 'modules', statusLookup, seen);
        fromModules.push(...records);
    }
    const fromNodeModules = includeNodeModules
        ? await collectPackages(nodeModulesDir, 'node_modules', statusLookup, seen)
        : [];
    const all = [...fromModules, ...fromNodeModules];
    const byName = new Map(all.map((m) => [m.name, m]));
    let changed = true;
    while (changed) {
        changed = false;
        for (const mod of all) {
            if (!mod.enabled)
                continue;
            if (!mod.hasRegistration)
                continue;
            const missing = mod.dependencies.filter((dep) => {
                const target = byName.get(dep);
                return !target || !target.enabled;
            });
            if (missing.length > 0) {
                mod.enabled = false;
                mod.missingDeps = missing;
                console.error(`Moduł "${mod.name}" wyłączony: brak zależności ${missing.join(', ')}`);
                changed = true;
            }
        }
    }
    const enabledSorted = topologicalSort(all.filter((m) => m.enabled));
    const disabled = all.filter((m) => !m.enabled);
    return [...enabledSorted, ...disabled];
};
export default {
    loadModuleRegistry
};

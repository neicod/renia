// @env: server
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export type ModuleSource = 'modules' | 'node_modules';

export type ModuleRecord = {
  name: string;
  path: string;
  source: ModuleSource;
  enabled: boolean;
  dependencies: string[];
  missingDeps?: string[];
  hasRegistration: boolean;
  registrationPath?: string;
};

export type RegistryOptions = {
  modulesDir?: string;
  nodeModulesDir?: string;
  configPath?: string;
  includeNodeModules?: boolean;
  statusMap?: Record<string, boolean | number | undefined>;
};

type DirEntry = fs.Dirent & { name: string };

const registrationCandidates = ['registration.ts', 'registration.js', 'registration.json'];

const normalizeStatus = (value: boolean | number | undefined): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return true;
};

const loadConfigStatus = async (configPath: string): Promise<Record<string, boolean | number>> => {
  if (!fs.existsSync(configPath)) return {};
  try {
    const raw = await fs.promises.readFile(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.modules && typeof parsed.modules === 'object') {
      return parsed.modules as Record<string, boolean | number>;
    }
  } catch (error) {
    console.error(`Nie udało się wczytać ${configPath}:`, error);
  }
  return {};
};

const readPackageName = async (pkgPath: string, fallback: string): Promise<string> => {
  try {
    const raw = await fs.promises.readFile(pkgPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed?.name && typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
      return parsed.name;
    }
  } catch {
    // pomijamy błędy, fallback pozostaje
  }
  return fallback;
};

const loadRegistrationMeta = async (
  registrationPath?: string
): Promise<{ dependencies: string[] }> => {
  if (!registrationPath) return { dependencies: [] };

  try {
    const imported = await import(pathToFileURL(registrationPath).href);
    const data = (imported?.default ?? imported) as any;
    if (data && typeof data === 'object' && Array.isArray(data.dependencies)) {
      return { dependencies: data.dependencies.filter((d: unknown) => typeof d === 'string') };
    }
  } catch (error) {
    console.error(`Nie udało się wczytać registration z ${registrationPath}:`, error);
  }

  return { dependencies: [] };
};

const collectPackages = async (
  rootDir: string,
  source: ModuleSource,
  statusLookup: (name: string) => boolean,
  seen: Set<string>
): Promise<ModuleRecord[]> => {
  if (!fs.existsSync(rootDir)) return [];

  const entries = await fs.promises.readdir(rootDir, { withFileTypes: true });
  const records: ModuleRecord[] = [];

  const pushRecord = async (entry: DirEntry, baseDir: string, nameOverride?: string) => {
    if (!entry.isDirectory()) return;
    const dirPath = path.join(baseDir, entry.name);
    const pkgPath = path.join(dirPath, 'package.json');
    if (!fs.existsSync(pkgPath)) return;

    let pkgDeps: string[] = [];
    let name = nameOverride ?? entry.name;
    let registrationPath: string | undefined;
    let hasRegistration = false;
    let regDeps: string[] = [];

    try {
      const raw = await fs.promises.readFile(pkgPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed?.name && typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
        name = parsed.name;
      }
      const deps = parsed?.dependencies ?? {};
      const peers = parsed?.peerDependencies ?? {};
      pkgDeps = [...Object.keys(deps), ...Object.keys(peers)];
    } catch {
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

    if (seen.has(name)) return;

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

  for (const entry of entries) {
    if (entry.name.startsWith('@') && entry.isDirectory() && source === 'node_modules') {
      const scopeDir = path.join(rootDir, entry.name);
      const scopedEntries = await fs.promises.readdir(scopeDir, { withFileTypes: true });
      for (const scopedEntry of scopedEntries) {
        await pushRecord(scopedEntry as DirEntry, scopeDir, `${entry.name}/${scopedEntry.name}`);
      }
      continue;
    }

    await pushRecord(entry as DirEntry, rootDir);
  }

  return records;
};

const topologicalSort = (records: ModuleRecord[]): ModuleRecord[] => {
  const graph = new Map<string, string[]>();
  const modulesByName = new Map(records.map((r) => [r.name, r]));
  for (const record of records) {
    const deps = record.dependencies.filter((dep) => {
      const depModule = modulesByName.get(dep);
      return depModule && depModule.enabled;
    });
    graph.set(record.name, deps);
  }

  const visited = new Set<string>();
  const temp = new Set<string>();
  const sorted: ModuleRecord[] = [];
  let hasCycle = false;

  const visit = (name: string) => {
    if (temp.has(name)) {
      hasCycle = true;
      return;
    }
    if (visited.has(name)) return;
    temp.add(name);
    const neighbors = graph.get(name) ?? [];
    neighbors.forEach(visit);
    temp.delete(name);
    visited.add(name);
    const record = modulesByName.get(name);
    if (record) sorted.push(record);
  };

  for (const record of records) {
    visit(record.name);
  }

  if (hasCycle) {
    console.error('Wykryto cykl zależności modułów; kolejność może być niedeterministyczna.');
  }

  return sorted;
};

export const loadModuleRegistry = async (options: RegistryOptions = {}): Promise<ModuleRecord[]> => {
  const modulesDir = options.modulesDir ?? path.resolve(process.cwd(), 'modules');
  const nodeModulesDir = options.nodeModulesDir ?? path.resolve(process.cwd(), 'node_modules');
  const includeNodeModules = options.includeNodeModules !== false;
  const statusMap = options.statusMap ?? {};
  const configPath = options.configPath ?? path.resolve(process.cwd(), 'app/etc/config.json');
  const configStatus = await loadConfigStatus(configPath);

  const statusLookup = (name: string): boolean => {
    if (name in statusMap) return normalizeStatus(statusMap[name]);
    if (name in configStatus) return normalizeStatus(configStatus[name]);
    return false; // brak wpisu => wyłączony
  };

  const seen = new Set<string>();
  const fromModules = await collectPackages(modulesDir, 'modules', statusLookup, seen);
  const fromNodeModules = includeNodeModules
    ? await collectPackages(nodeModulesDir, 'node_modules', statusLookup, seen)
    : [];

  const all = [...fromModules, ...fromNodeModules];
  const byName = new Map(all.map((m) => [m.name, m]));

  let changed = true;
  while (changed) {
    changed = false;
    for (const mod of all) {
      if (!mod.enabled) continue;
      if (!mod.hasRegistration) continue;

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

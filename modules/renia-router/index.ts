import path from 'node:path';
import fs from 'node:fs';
import { loadModuleRegistry } from 'renia-module-registry';

export type RouteDefinition = {
  path: string;
  componentPath?: string;
  component?: string;
  redirect?: string;
  status?: number;
  priority?: number;
  guards?: string[];
  meta?: Record<string, unknown>;
};

export type RouterOptions = {
  routesFileName?: string; // domyślnie routes.js / routes.ts
  configPath?: string;
  includeNodeModules?: boolean;
  statusMap?: Record<string, boolean | number | undefined>;
};

export type RouterEntry = RouteDefinition & { module: string };

const defaultRouteFiles = ['routes.ts', 'routes.js'];

const isEqual = (a: unknown, b: unknown): boolean => {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
};

const readRoutesFile = async (filePath: string): Promise<RouteDefinition[] | null> => {
  if (!fs.existsSync(filePath)) return null;
  try {
    if (filePath.endsWith('.json')) {
      const raw = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(raw);
    }
    const imported = await import(filePath);
    const data = imported?.default ?? imported;
    if (Array.isArray(data)) return data as RouteDefinition[];
    if (Array.isArray(data?.routes)) return data.routes as RouteDefinition[];
  } catch (error) {
    console.warn(`Nie udało się wczytać tras z ${filePath}:`, error);
  }
  return null;
};

const pickRoutesFile = (moduleDir: string, explicit?: string): string | null => {
  if (explicit) {
    const candidate = path.resolve(moduleDir, explicit);
    return fs.existsSync(candidate) ? candidate : null;
  }
  for (const filename of defaultRouteFiles) {
    const candidate = path.resolve(moduleDir, filename);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
};

const normalizeRoute = (route: RouteDefinition): RouteDefinition | null => {
  if (!route || typeof route !== 'object') return null;
  if (typeof route.path !== 'string' || !route.path.trim()) return null;
  if (!route.component && !route.componentPath) return null;
  const normalized: RouteDefinition = {
    path: route.path,
    componentPath: route.componentPath,
    component: route.component,
    redirect: route.redirect,
    status: route.status,
    priority: route.priority ?? 0,
    guards: Array.isArray(route.guards) ? route.guards.slice() : undefined,
    meta: route.meta && typeof route.meta === 'object' ? route.meta : undefined
  };
  return normalized;
};

const mergeRoutes = (entries: RouterEntry[]): RouterEntry[] => {
  const seen = new Map<string, RouterEntry>();
  for (const entry of entries) {
    const key = `${entry.path}::${entry.priority ?? 0}`;
    if (!seen.has(key)) {
      seen.set(key, entry);
    } else {
      const existing = seen.get(key)!;
      if (!isEqual(existing, entry)) {
        console.warn(
          `Kolizja tras dla "${entry.path}" o priorytecie ${entry.priority ?? 0} (moduły: ${existing.module} / ${entry.module}) — pomijam duplikat.`
        );
      }
    }
  }
  const unique = Array.from(seen.values());
  unique.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  return unique;
};

export const loadRoutesRegistry = async (options: RouterOptions = {}): Promise<RouterEntry[]> => {
  const {
    routesFileName,
    configPath,
    includeNodeModules,
    statusMap
  } = options;

  const modules = await loadModuleRegistry({
    configPath,
    includeNodeModules,
    statusMap
  });

  const activeModules = modules.filter((m) => m.enabled);
  const entries: RouterEntry[] = [];

  for (const mod of activeModules) {
    const file = pickRoutesFile(mod.path, routesFileName);
    if (!file) continue;
    const routes = await readRoutesFile(file);
    if (!routes || routes.length === 0) continue;

    for (const route of routes) {
      const normalized = normalizeRoute(route);
      if (!normalized) continue;
      entries.push({ ...normalized, module: mod.name });
    }
  }

  return mergeRoutes(entries);
};

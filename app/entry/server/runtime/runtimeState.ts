// @env: server

import fs from 'node:fs';
import { loadRoutesRegistry } from '@renia/framework/router';
import { loadComponentRegistrations } from '@renia/framework/registry/loadModuleComponents';
import { registerComponents } from '@renia/framework/registry/componentRegistry';
import { Layout1Column, Layout2ColumnsLeft, LayoutEmpty } from '@renia/framework/layout';

let cachedRoutes: Awaited<ReturnType<typeof loadRoutesRegistry>> | null = null;
let cachedEnabledModules: string[] | null = null;
let cachedConfigMtimeMs: number | null = null;
let cachedComponentRegistrationsMtimeMs: number | null = null;
let frameworkLayoutsRegistered = false;

const isRoutesCacheEnabled = (): boolean => {
  const raw = process.env.ROUTES_CACHE_ENABLED;
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  return process.env.NODE_ENV === 'production';
};

const isComponentRegistrationsCacheEnabled = (): boolean => {
  const raw = process.env.COMPONENT_REGISTRATIONS_CACHE_ENABLED;
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  return process.env.NODE_ENV === 'production';
};

const getConfigMtimeMs = (configPath: string): number | null => {
  try {
    const configStat = fs.existsSync(configPath) ? fs.statSync(configPath) : null;
    return configStat?.mtimeMs ?? null;
  } catch {
    return null;
  }
};

const readEnabledModules = (configPath: string): string[] => {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return Object.entries(config.modules ?? {})
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
};

export type RuntimeState = {
  enabledModules: string[];
  routes: Awaited<ReturnType<typeof loadRoutesRegistry>>;
  configMtimeMs: number | null;
};

export const ensureFrameworkLayoutComponentsRegistered = () => {
  if (frameworkLayoutsRegistered) return;
  registerComponents({
    '@renia/framework/layout/layouts/Layout1Column': Layout1Column,
    '@renia/framework/layout/layouts/Layout2ColumnsLeft': Layout2ColumnsLeft,
    '@renia/framework/layout/layouts/LayoutEmpty': LayoutEmpty
  });
  frameworkLayoutsRegistered = true;
};

export const loadRuntimeState = async (configPath: string): Promise<RuntimeState> => {
  const cacheEnabled = isRoutesCacheEnabled();
  const configMtimeMs = getConfigMtimeMs(configPath);

  const canUseCache =
    cacheEnabled &&
    cachedRoutes &&
    cachedEnabledModules &&
    cachedConfigMtimeMs !== null &&
    configMtimeMs !== null &&
    cachedConfigMtimeMs === configMtimeMs;

  const enabledModules = canUseCache ? cachedEnabledModules! : readEnabledModules(configPath);

  const componentsCacheEnabled = isComponentRegistrationsCacheEnabled();
  const canSkipComponentRegistrations =
    componentsCacheEnabled &&
    cachedComponentRegistrationsMtimeMs !== null &&
    configMtimeMs !== null &&
    cachedComponentRegistrationsMtimeMs === configMtimeMs;

  if (!canSkipComponentRegistrations) {
    await loadComponentRegistrations({ configPath });
    if (componentsCacheEnabled && configMtimeMs !== null) {
      cachedComponentRegistrationsMtimeMs = configMtimeMs;
    }
  }

  const routes = canUseCache ? cachedRoutes! : await loadRoutesRegistry({ configPath });
  if (cacheEnabled && !canUseCache && configMtimeMs !== null) {
    cachedRoutes = routes;
    cachedEnabledModules = enabledModules;
    cachedConfigMtimeMs = configMtimeMs;
  }

  return { enabledModules, routes, configMtimeMs };
};

export const buildStatusMap = (enabledModules: string[]) => Object.fromEntries(enabledModules.map((name) => [name, true]));

export default {
  loadRuntimeState,
  ensureFrameworkLayoutComponentsRegistered,
  buildStatusMap
};


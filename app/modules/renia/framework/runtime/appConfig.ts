// @env: mixed

export type AppConfig = Record<string, unknown>;

const readFromRequestContext = (): AppConfig | null => {
  const getter = (globalThis as any).__RENIA_GET_REQUEST_CONTEXT__ as undefined | (() => any);
  if (typeof getter !== 'function') return null;
  const ctx = getter();
  const cfg = ctx?.config;
  return cfg && typeof cfg === 'object' ? (cfg as AppConfig) : null;
};

const readFromBootstrap = (): AppConfig | null => {
  const win = (globalThis as any).window as any;
  if (!win) return null;
  const cfg = win.__APP_BOOTSTRAP__?.config;
  return cfg && typeof cfg === 'object' ? (cfg as AppConfig) : null;
};

/**
 * Reads the current app config for both SSR and CSR:
 * - server: prefers request-scoped context (AsyncLocalStorage) when available,
 * - browser: reads from window.__APP_BOOTSTRAP__.config,
 */
export const readAppConfig = (): AppConfig => {
  return readFromRequestContext() ?? readFromBootstrap() ?? {};
};

export default {
  readAppConfig
};

// @env: mixed
const readFromRequestContext = () => {
    const getter = globalThis.__RENIA_GET_REQUEST_CONTEXT__;
    if (typeof getter !== 'function')
        return null;
    const ctx = getter();
    const cfg = ctx?.config;
    return cfg && typeof cfg === 'object' ? cfg : null;
};
const readFromBootstrap = () => {
    const win = globalThis.window;
    if (!win)
        return null;
    const cfg = win.__APP_BOOTSTRAP__?.config;
    return cfg && typeof cfg === 'object' ? cfg : null;
};
/**
 * Reads the current app config for both SSR and CSR:
 * - server: prefers request-scoped context (AsyncLocalStorage) when available,
 * - browser: reads from window.__APP_BOOTSTRAP__.config,
 */
export const readAppConfig = () => {
    return readFromRequestContext() ?? readFromBootstrap() ?? {};
};
export default {
    readAppConfig
};

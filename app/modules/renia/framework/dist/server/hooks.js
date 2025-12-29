import { AsyncLocalStorage } from 'node:async_hooks';
let prefixResolver = (pathname) => {
    const normalized = (pathname || '/').startsWith('/') ? (pathname || '/') : `/${pathname || ''}`;
    return { basePath: '', routingPath: normalized };
};
let appConfigProvider = () => ({});
export const registerPrefixResolver = (resolver) => {
    if (typeof resolver !== 'function')
        return;
    prefixResolver = resolver;
};
export const resolvePrefix = (pathname, req) => {
    try {
        const out = prefixResolver(pathname, req);
        const basePath = typeof out?.basePath === 'string' ? out.basePath : '';
        const routingPath = typeof out?.routingPath === 'string' ? out.routingPath : pathname;
        return { ...out, basePath, routingPath };
    }
    catch (error) {
        console.error('[PrefixResolver] Failed; falling back to identity', error);
        const normalized = (pathname || '/').startsWith('/') ? (pathname || '/') : `/${pathname || ''}`;
        return { basePath: '', routingPath: normalized };
    }
};
export const registerAppConfigProvider = (provider) => {
    if (typeof provider !== 'function')
        return;
    appConfigProvider = provider;
};
export const buildAppConfig = async (args) => {
    try {
        const out = await appConfigProvider(args);
        return out && typeof out === 'object' ? out : {};
    }
    catch (error) {
        console.error('[AppConfigProvider] Failed; using empty config', error);
        return {};
    }
};
const requestContextAugmenters = [];
const requestContextStorage = new AsyncLocalStorage();
if (typeof globalThis.__RENIA_GET_REQUEST_CONTEXT__ !== 'function') {
    globalThis.__RENIA_GET_REQUEST_CONTEXT__ = () => requestContextStorage.getStore();
}
export const registerRequestContextAugmenter = (augmenter) => {
    if (typeof augmenter !== 'function')
        return;
    requestContextAugmenters.push(augmenter);
};
// Backwards/ergonomic alias: modules register request-scoped metadata here.
export const registerRequestContext = registerRequestContextAugmenter;
export const getRequestContext = () => requestContextStorage.getStore() ?? null;
export const runWithRequestContext = async (ctx, fn) => {
    for (const augmenter of requestContextAugmenters) {
        try {
            augmenter(ctx);
        }
        catch (error) {
            console.error('[RequestContext] Augmenter failed', error);
        }
    }
    return await requestContextStorage.run(ctx, async () => await fn());
};
export const withOverriddenPath = (req, routingPath) => {
    return new Proxy(req, {
        get(target, prop, receiver) {
            if (prop === 'path')
                return routingPath;
            return Reflect.get(target, prop, receiver);
        }
    });
};
export default {
    registerPrefixResolver,
    resolvePrefix,
    registerAppConfigProvider,
    buildAppConfig,
    registerRequestContext,
    registerRequestContextAugmenter,
    getRequestContext,
    runWithRequestContext,
    withOverriddenPath
};

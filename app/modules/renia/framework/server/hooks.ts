// @env: server
import type { Request } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';

export type PrefixResolution = {
  basePath: string;
  routingPath: string;
  storeCode?: string | null;
  locale?: string | null;
};

export type PrefixResolver = (pathname: string, req?: Request) => PrefixResolution;

export type AppConfigProviderArgs = {
  purpose: 'ssr' | 'page-context' | 'debug';
  req: Request;
  prefix: PrefixResolution;
  url: URL;
};

export type AppConfigProvider = (args: AppConfigProviderArgs) => Promise<Record<string, unknown>> | Record<string, unknown>;

let prefixResolver: PrefixResolver = (pathname: string): PrefixResolution => {
  const normalized = (pathname || '/').startsWith('/') ? (pathname || '/') : `/${pathname || ''}`;
  return { basePath: '', routingPath: normalized };
};

let appConfigProvider: AppConfigProvider = () => ({});

export const registerPrefixResolver = (resolver: PrefixResolver) => {
  if (typeof resolver !== 'function') return;
  prefixResolver = resolver;
};

export const resolvePrefix = (pathname: string, req?: Request): PrefixResolution => {
  try {
    const out = prefixResolver(pathname, req);
    const basePath = typeof out?.basePath === 'string' ? out.basePath : '';
    const routingPath = typeof out?.routingPath === 'string' ? out.routingPath : pathname;
    return { ...out, basePath, routingPath };
  } catch (error) {
    console.error('[PrefixResolver] Failed; falling back to identity', error);
    const normalized = (pathname || '/').startsWith('/') ? (pathname || '/') : `/${pathname || ''}`;
    return { basePath: '', routingPath: normalized };
  }
};

export const registerAppConfigProvider = (provider: AppConfigProvider) => {
  if (typeof provider !== 'function') return;
  appConfigProvider = provider;
};

export const buildAppConfig = async (args: AppConfigProviderArgs): Promise<Record<string, unknown>> => {
  try {
    const out = await appConfigProvider(args);
    return out && typeof out === 'object' ? (out as Record<string, unknown>) : {};
  } catch (error) {
    console.error('[AppConfigProvider] Failed; using empty config', error);
    return {};
  }
};

export type RequestContext = {
  requestId: string;
  purpose: AppConfigProviderArgs['purpose'];
  req: Request;
  prefix: PrefixResolution;
  url: URL;
  config: Record<string, unknown>;
};

export type RequestContextAugmenter = (ctx: RequestContext) => void;

const requestContextAugmenters: RequestContextAugmenter[] = [];
const requestContextStorage = new AsyncLocalStorage<RequestContext>();

if (typeof (globalThis as any).__RENIA_GET_REQUEST_CONTEXT__ !== 'function') {
  (globalThis as any).__RENIA_GET_REQUEST_CONTEXT__ = () => requestContextStorage.getStore();
}

export const registerRequestContextAugmenter = (augmenter: RequestContextAugmenter) => {
  if (typeof augmenter !== 'function') return;
  requestContextAugmenters.push(augmenter);
};

// Backwards/ergonomic alias: modules register request-scoped metadata here.
export const registerRequestContext = registerRequestContextAugmenter;

export const getRequestContext = (): RequestContext | null => requestContextStorage.getStore() ?? null;

export const runWithRequestContext = async <T>(ctx: RequestContext, fn: () => Promise<T> | T): Promise<T> => {
  for (const augmenter of requestContextAugmenters) {
    try {
      augmenter(ctx);
    } catch (error) {
      console.error('[RequestContext] Augmenter failed', error);
    }
  }
  return await requestContextStorage.run(ctx, async () => await fn());
};

export const withOverriddenPath = <T extends object>(req: T, routingPath: string): T => {
  return new Proxy(req, {
    get(target, prop, receiver) {
      if (prop === 'path') return routingPath;
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

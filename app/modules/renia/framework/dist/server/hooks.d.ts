import type { Request } from 'express';
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
export declare const registerPrefixResolver: (resolver: PrefixResolver) => void;
export declare const resolvePrefix: (pathname: string, req?: Request) => PrefixResolution;
export declare const registerAppConfigProvider: (provider: AppConfigProvider) => void;
export declare const buildAppConfig: (args: AppConfigProviderArgs) => Promise<Record<string, unknown>>;
export type RequestContext = {
    requestId: string;
    purpose: AppConfigProviderArgs['purpose'];
    req: Request;
    prefix: PrefixResolution;
    url: URL;
    config: Record<string, unknown>;
};
export type RequestContextAugmenter = (ctx: RequestContext) => void;
export declare const registerRequestContextAugmenter: (augmenter: RequestContextAugmenter) => void;
export declare const registerRequestContext: (augmenter: RequestContextAugmenter) => void;
export declare const getRequestContext: () => RequestContext | null;
export declare const runWithRequestContext: <T>(ctx: RequestContext, fn: () => Promise<T> | T) => Promise<T>;
export declare const withOverriddenPath: <T extends object>(req: T, routingPath: string) => T;
declare const _default: {
    registerPrefixResolver: (resolver: PrefixResolver) => void;
    resolvePrefix: (pathname: string, req?: Request) => PrefixResolution;
    registerAppConfigProvider: (provider: AppConfigProvider) => void;
    buildAppConfig: (args: AppConfigProviderArgs) => Promise<Record<string, unknown>>;
    registerRequestContext: (augmenter: RequestContextAugmenter) => void;
    registerRequestContextAugmenter: (augmenter: RequestContextAugmenter) => void;
    getRequestContext: () => RequestContext | null;
    runWithRequestContext: <T>(ctx: RequestContext, fn: () => Promise<T> | T) => Promise<T>;
    withOverriddenPath: <T extends object>(req: T, routingPath: string) => T;
};
export default _default;
//# sourceMappingURL=hooks.d.ts.map
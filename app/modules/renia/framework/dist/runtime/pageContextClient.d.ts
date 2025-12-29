import type { RouteMeta } from '@renia/framework/router/routeMeta';
import type { PageContext } from './PageContext';
export type PageContextPayload = {
    pageContext?: PageContext;
    contexts?: string[];
    routeMeta?: RouteMeta;
};
export type PageContextTelemetrySnapshot = {
    callsTotal: number;
    callsByReason: Record<string, number>;
    callsByPath: Record<string, number>;
    cacheHits: number;
    cacheMisses: number;
    networkCalls: number;
    networkByReason: Record<string, number>;
    last: Array<{
        at: number;
        reason: string;
        url: string;
        kind: 'call' | 'cache_hit' | 'cache_miss' | 'network' | 'response' | 'error';
    }>;
};
type FetchArgs = {
    reason: string;
    navSeq: number;
    clientInstance: string | null;
};
export declare const getPageContextTelemetry: () => PageContextTelemetrySnapshot;
export declare const resetPageContextTelemetry: () => void;
export declare const getClientInstanceId: () => string | null;
export declare const normalizeTargetUrl: (url: string) => string;
export declare const getPageContextPayload: (url: string, args: FetchArgs) => Promise<PageContextPayload | null>;
export declare const prefetchPageContext: (url: string, args: Omit<FetchArgs, "reason">) => void;
declare const _default: {
    getClientInstanceId: () => string | null;
    normalizeTargetUrl: (url: string) => string;
    getPageContextPayload: (url: string, args: FetchArgs) => Promise<PageContextPayload | null>;
    prefetchPageContext: (url: string, args: Omit<FetchArgs, "reason">) => void;
};
export default _default;
//# sourceMappingURL=pageContextClient.d.ts.map
export type TtlCacheOptions = {
    ttlMs: number;
    maxEntries?: number;
    name?: string;
};
export declare class TtlCache<V> {
    private map;
    private ttlMs;
    private maxEntries;
    private name?;
    constructor(options: TtlCacheOptions);
    private now;
    private pruneExpired;
    private pruneSize;
    get(key: string): V | undefined;
    set(key: string, value: V): void;
    getOrSet(key: string, factory: () => Promise<V>): Promise<V>;
    stats(): {
        name: string | undefined;
        size: number;
        ttlMs: number;
        maxEntries: number;
    };
}
export declare const getGlobalTtlCache: <V>(name: string, options: Omit<TtlCacheOptions, "name">) => TtlCache<V>;
export declare const listGlobalTtlCaches: () => Array<ReturnType<TtlCache<any>["stats"]> & {
    key: string;
}>;
declare const _default: {
    TtlCache: typeof TtlCache;
    getGlobalTtlCache: <V>(name: string, options: Omit<TtlCacheOptions, "name">) => TtlCache<V>;
    listGlobalTtlCaches: () => Array<ReturnType<TtlCache<any>["stats"]> & {
        key: string;
    }>;
};
export default _default;
//# sourceMappingURL=ttlCache.d.ts.map
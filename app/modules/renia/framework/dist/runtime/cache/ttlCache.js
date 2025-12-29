// @env: mixed
export class TtlCache {
    constructor(options) {
        this.map = new Map();
        this.ttlMs = Math.max(0, Number(options.ttlMs) || 0);
        this.maxEntries = Math.max(1, Number(options.maxEntries ?? 500) || 500);
        this.name = options.name;
    }
    now() {
        return Date.now();
    }
    pruneExpired(now) {
        for (const [key, entry] of this.map.entries()) {
            if (entry.expiresAt <= now) {
                this.map.delete(key);
            }
        }
    }
    pruneSize() {
        while (this.map.size > this.maxEntries) {
            const oldestKey = this.map.keys().next().value;
            if (!oldestKey)
                return;
            this.map.delete(oldestKey);
        }
    }
    get(key) {
        if (!this.ttlMs)
            return undefined;
        const now = this.now();
        const entry = this.map.get(key);
        if (!entry)
            return undefined;
        if (entry.expiresAt <= now) {
            this.map.delete(key);
            return undefined;
        }
        if (entry.value instanceof Promise) {
            // Avoid exposing in-flight promises through get(); use getOrSet() for request coalescing.
            return undefined;
        }
        return entry.value;
    }
    set(key, value) {
        if (!this.ttlMs)
            return;
        const now = this.now();
        this.pruneExpired(now);
        this.map.set(key, { expiresAt: now + this.ttlMs, value });
        this.pruneSize();
    }
    async getOrSet(key, factory) {
        if (!this.ttlMs)
            return factory();
        const now = this.now();
        const existing = this.map.get(key);
        if (existing && existing.expiresAt > now) {
            return existing.value instanceof Promise ? await existing.value : existing.value;
        }
        this.pruneExpired(now);
        const task = (async () => {
            try {
                return await factory();
            }
            catch (error) {
                // Do not cache failures.
                this.map.delete(key);
                throw error;
            }
        })();
        this.map.set(key, { expiresAt: now + this.ttlMs, value: task });
        this.pruneSize();
        const resolved = await task;
        this.map.set(key, { expiresAt: this.now() + this.ttlMs, value: resolved });
        return resolved;
    }
    stats() {
        return { name: this.name, size: this.map.size, ttlMs: this.ttlMs, maxEntries: this.maxEntries };
    }
}
export const getGlobalTtlCache = (name, options) => {
    const key = `__RENIA_RUNTIME_TTL_CACHE__:${name}`;
    const globalAny = globalThis;
    const existing = globalAny[key];
    if (existing)
        return existing;
    const created = new TtlCache({ ...options, name });
    globalAny[key] = created;
    return created;
};
export const listGlobalTtlCaches = () => {
    const globalAny = globalThis;
    const prefix = '__RENIA_RUNTIME_TTL_CACHE__:';
    const keys = Object.keys(globalAny).filter((k) => k.startsWith(prefix));
    const out = keys
        .map((key) => {
        const cache = globalAny[key];
        const stats = cache && typeof cache.stats === 'function' ? cache.stats() : {};
        return { key, ...stats };
    })
        .sort((a, b) => String(a.key).localeCompare(String(b.key)));
    return out;
};
export default {
    TtlCache,
    getGlobalTtlCache,
    listGlobalTtlCaches
};

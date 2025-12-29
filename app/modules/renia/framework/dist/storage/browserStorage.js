// @env: mixed
/**
 * Centralna obsługa localStorage. Dzięki temu łatwo prześledzić użycia i statystyki.
 * Nie importuj window.localStorage bezpośrednio – korzystaj z eksportów poniżej.
 */
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const usageMap = new Map();
const ensureUsage = (key) => {
    const record = usageMap.get(key);
    if (record)
        return record;
    const next = {
        key,
        reads: 0,
        writes: 0,
        removes: 0,
        lastValue: null,
        lastUpdatedAt: 0
    };
    usageMap.set(key, next);
    return next;
};
const trackUsage = (key, kind, value = null) => {
    const record = ensureUsage(key);
    if (kind === 'read') {
        record.reads += 1;
        record.lastValue = value;
    }
    else if (kind === 'write') {
        record.writes += 1;
        record.lastValue = value;
        record.lastUpdatedAt = Date.now();
    }
    else if (kind === 'remove') {
        record.removes += 1;
        record.lastValue = null;
        record.lastUpdatedAt = Date.now();
    }
};
const safeCall = (fn, fallback) => {
    try {
        return fn();
    }
    catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[browserStorage] Operacja zakończona błędem', error);
        }
        return fallback;
    }
};
export const browserStorage = {
    getItem(key) {
        if (!isBrowser)
            return null;
        const value = safeCall(() => window.localStorage.getItem(key), null);
        trackUsage(key, 'read', value);
        return value;
    },
    setItem(key, value) {
        if (!isBrowser)
            return;
        safeCall(() => {
            window.localStorage.setItem(key, value);
            return true;
        }, true);
        trackUsage(key, 'write', value);
    },
    removeItem(key) {
        if (!isBrowser)
            return;
        safeCall(() => {
            window.localStorage.removeItem(key);
            return true;
        }, true);
        trackUsage(key, 'remove');
    },
    getUsageSnapshot() {
        return Array.from(usageMap.values()).map((record) => ({ ...record }));
    }
};
export default browserStorage;

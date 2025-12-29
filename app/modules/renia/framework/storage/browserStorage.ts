// @env: mixed
/**
 * Centralna obsługa localStorage. Dzięki temu łatwo prześledzić użycia i statystyki.
 * Nie importuj window.localStorage bezpośrednio – korzystaj z eksportów poniżej.
 */

type UsageRecord = {
  key: string;
  reads: number;
  writes: number;
  removes: number;
  lastValue: string | null;
  lastUpdatedAt: number;
};

type UsageKind = 'read' | 'write' | 'remove';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const usageMap = new Map<string, UsageRecord>();

const ensureUsage = (key: string): UsageRecord => {
  const record = usageMap.get(key);
  if (record) return record;
  const next: UsageRecord = {
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

const trackUsage = (key: string, kind: UsageKind, value: string | null = null) => {
  const record = ensureUsage(key);
  if (kind === 'read') {
    record.reads += 1;
    record.lastValue = value;
  } else if (kind === 'write') {
    record.writes += 1;
    record.lastValue = value;
    record.lastUpdatedAt = Date.now();
  } else if (kind === 'remove') {
    record.removes += 1;
    record.lastValue = null;
    record.lastUpdatedAt = Date.now();
  }
};

const safeCall = <T>(fn: () => T, fallback: T) => {
  try {
    return fn();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[browserStorage] Operacja zakończona błędem', error);
    }
    return fallback;
  }
};

export const browserStorage = {
  getItem(key: string): string | null {
    if (!isBrowser) return null;
    const value = safeCall(() => window.localStorage!.getItem(key), null);
    trackUsage(key, 'read', value);
    return value;
  },
  setItem(key: string, value: string) {
    if (!isBrowser) return;
    safeCall(() => {
      window.localStorage!.setItem(key, value);
      return true;
    }, true);
    trackUsage(key, 'write', value);
  },
  removeItem(key: string) {
    if (!isBrowser) return;
    safeCall(() => {
      window.localStorage!.removeItem(key);
      return true;
    }, true);
    trackUsage(key, 'remove');
  },
  getUsageSnapshot(): UsageRecord[] {
    return Array.from(usageMap.values()).map((record) => ({ ...record }));
  }
};

export default browserStorage;

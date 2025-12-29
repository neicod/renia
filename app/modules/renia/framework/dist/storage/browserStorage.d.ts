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
export declare const browserStorage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    getUsageSnapshot(): UsageRecord[];
};
export default browserStorage;
//# sourceMappingURL=browserStorage.d.ts.map
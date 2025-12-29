export interface AbortSignalWrapper {
    signal: AbortSignal;
    cleanup: () => void;
}
export declare class TimeoutManager {
    createAbortSignal(timeoutMs: number): AbortSignalWrapper;
    createTimeoutError(timeoutMs: number): Error;
    isTimeoutError(error: any): boolean;
}
//# sourceMappingURL=TimeoutManager.d.ts.map
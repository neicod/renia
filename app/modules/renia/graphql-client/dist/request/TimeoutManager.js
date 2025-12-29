// @env: mixed
export class TimeoutManager {
    createAbortSignal(timeoutMs) {
        const controller = new AbortController();
        const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
        return {
            signal: controller.signal,
            cleanup: () => clearTimeout(timeoutHandle)
        };
    }
    createTimeoutError(timeoutMs) {
        return new Error(`GraphQL request timed out after ${timeoutMs}ms`);
    }
    isTimeoutError(error) {
        return error?.name === 'AbortError';
    }
}

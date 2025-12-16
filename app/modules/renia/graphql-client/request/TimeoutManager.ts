// @env: mixed

export interface AbortSignalWrapper {
  signal: AbortSignal;
  cleanup: () => void;
}

export class TimeoutManager {
  createAbortSignal(timeoutMs: number): AbortSignalWrapper {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    return {
      signal: controller.signal,
      cleanup: () => clearTimeout(timeoutHandle)
    };
  }

  createTimeoutError(timeoutMs: number): Error {
    return new Error(`GraphQL request timed out after ${timeoutMs}ms`);
  }

  isTimeoutError(error: any): boolean {
    return error?.name === 'AbortError';
  }
}

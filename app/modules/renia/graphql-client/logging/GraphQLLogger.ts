// @env: mixed

export interface GraphQLLogger {
  logRequest(operationId: string | undefined, method: string, payload: unknown, variables?: Record<string, unknown>): void;
  logResponse(status: number, operationId: string | undefined, duration: number, errorCount?: number): void;
  logError(operationId: string | undefined, method: string, endpoint: string, duration: number, error: Error): void;
}

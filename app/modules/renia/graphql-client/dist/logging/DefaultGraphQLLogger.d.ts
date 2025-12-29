import type { GraphQLLogger } from './GraphQLLogger';
/**
 * DefaultGraphQLLogger - Basic logging implementation
 *
 * Note: Does not use renia-logger to avoid module loading issues
 * Logging can be controlled via environment variables:
 * - GRAPHQL_LOG_REQUEST=0  - Disable request logging
 * - GRAPHQL_LOG_RESPONSE=0 - Disable response logging
 */
export declare class DefaultGraphQLLogger implements GraphQLLogger {
    private logToConsole;
    logRequest(operationId: string | undefined, method: string, payload: unknown, variables?: Record<string, unknown>): void;
    logResponse(status: number, operationId: string | undefined, duration: number, errorCount?: number): void;
    logError(operationId: string | undefined, method: string, endpoint: string, duration: number, error: Error): void;
}
//# sourceMappingURL=DefaultGraphQLLogger.d.ts.map
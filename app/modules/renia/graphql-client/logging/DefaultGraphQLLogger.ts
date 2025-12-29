// @env: mixed

import type { GraphQLLogger } from './GraphQLLogger';

const getEnv = (key: string) =>
  typeof process !== 'undefined' && process.env ? process.env[key] : undefined;

/**
 * DefaultGraphQLLogger - Basic logging implementation
 *
 * Note: Does not use renia-logger to avoid module loading issues
 * Logging can be controlled via environment variables:
 * - GRAPHQL_LOG_REQUEST=0  - Disable request logging
 * - GRAPHQL_LOG_RESPONSE=0 - Disable response logging
 */
export class DefaultGraphQLLogger implements GraphQLLogger {
  private logToConsole(level: string, message: string, data?: unknown): void {
    if (typeof console !== 'undefined') {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      const sink = console as unknown as Record<string, (...args: unknown[]) => void>;
      const log = sink[consoleMethod] ?? console.log;
      log(`[GraphQL ${level.toUpperCase()}] ${message}`, data || '');
    }
  }

  logRequest(operationId: string | undefined, method: string, payload: unknown, variables?: Record<string, unknown>): void {
    if (getEnv('GRAPHQL_LOG_REQUEST') === '0') {
      return;
    }

    this.logToConsole('info', `REQUEST: ${method} ${operationId || 'query'}`, {
      payload,
      variables
    });
  }

  logResponse(status: number, operationId: string | undefined, duration: number, errorCount?: number): void {
    if (getEnv('GRAPHQL_LOG_RESPONSE') === '0') {
      return;
    }

    if (errorCount) {
      this.logToConsole('warn', `RESPONSE: ${operationId || 'query'} (${errorCount} errors)`, {
        status,
        duration,
        errorCount
      });
    } else {
      this.logToConsole('info', `RESPONSE: ${operationId || 'query'} (${status})`, {
        duration
      });
    }
  }

  logError(operationId: string | undefined, method: string, endpoint: string, duration: number, error: Error): void {
    this.logToConsole('error', `GraphQL request failed: ${method} ${endpoint}`, {
      operationId,
      duration,
      errorMessage: error.message,
      errorName: error.name
    });
  }
}

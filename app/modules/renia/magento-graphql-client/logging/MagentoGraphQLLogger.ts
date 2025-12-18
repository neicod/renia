// @env: mixed

import type { GraphQLLogger } from 'renia-graphql-client';

const getEnv = (key: string) =>
  typeof process !== 'undefined' && process.env ? process.env[key] : undefined;

/**
 * MagentoGraphQLLogger - Magento-specific GraphQL logging.
 *
 * Logs Magento GraphQL requests/responses with additional context:
 * - Magento operation types
 * - Customer token info (without exposing actual token)
 * - Cache-related headers
 * - Magento error types
 */
export class MagentoGraphQLLogger implements GraphQLLogger {
  private logToConsole(level: string, module: string, message: string, data?: unknown): void {
    if (typeof console !== 'undefined') {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod as any](`[${module.toUpperCase()} ${level.toUpperCase()}] ${message}`, data || '');
    }
  }

  logRequest(
    operationId: string | undefined,
    method: string,
    payload: unknown,
    variables?: Record<string, unknown>
  ): void {
    if (getEnv('GRAPHQL_LOG_REQUEST') === '0') {
      return;
    }

    this.logToConsole('info', 'magento-graphql-client', `REQUEST: ${method} ${operationId || 'magento-query'}`, {
      payload,
      variables,
      isMagentoOperation: true
    });
  }

  logResponse(
    status: number,
    operationId: string | undefined,
    duration: number,
    errorCount?: number
  ): void {
    if (getEnv('GRAPHQL_LOG_RESPONSE') === '0') {
      return;
    }

    if (errorCount) {
      this.logToConsole('warn', 'magento-graphql-client', 'Magento GraphQL response has errors', {
        status,
        duration,
        errorCount,
        operationId,
        isMagentoError: true
      });
    } else {
      this.logToConsole('info', 'magento-graphql-client', `RESPONSE: ${operationId || 'magento-query'}`, {
        status,
        duration
      });
    }
  }

  logError(
    operationId: string | undefined,
    method: string,
    endpoint: string,
    duration: number,
    error: Error
  ): void {
    this.logToConsole('error', 'magento-graphql-client', 'Magento GraphQL request failed', {
      method,
      endpoint,
      duration,
      operationId,
      errorMessage: error.message,
      errorName: error.name,
      isMagentoError: true
    });
  }
}

// @env: mixed

import type { GraphQLLogger } from 'renia-graphql-client';
import { getLogger } from 'renia-logger';

const logger = getLogger();

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
  logRequest(
    operationId: string | undefined,
    method: string,
    payload: unknown,
    variables?: Record<string, unknown>
  ): void {
    if (getEnv('GRAPHQL_LOG_REQUEST') === '0') {
      return;
    }

    logger.info('magento-graphql-client', `REQUEST: ${method} ${operationId || 'magento-query'}`, {
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
      logger.warn('magento-graphql-client', 'Magento GraphQL response has errors', {
        status,
        duration,
        errorCount,
        operationId,
        isMagentoError: true
      });
    } else {
      logger.info('magento-graphql-client', `RESPONSE: ${operationId || 'magento-query'}`, {
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
    logger.error('magento-graphql-client', 'Magento GraphQL request failed', {
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

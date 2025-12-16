// @env: mixed

import { getLogger } from 'renia-logger';
import type { GraphQLLogger } from './GraphQLLogger';

const logger = getLogger();

const getEnv = (key: string) =>
  typeof process !== 'undefined' && process.env ? process.env[key] : undefined;

export class DefaultGraphQLLogger implements GraphQLLogger {
  logRequest(operationId: string | undefined, method: string, payload: unknown, variables?: Record<string, unknown>): void {
    if (getEnv('GRAPHQL_LOG_REQUEST') === '0') {
      return;
    }

    logger.info('renia-graphql-client', `REQUEST: ${method} ${operationId || 'query'}`, {
      payload,
      variables
    });
  }

  logResponse(status: number, operationId: string | undefined, duration: number, errorCount?: number): void {
    if (getEnv('GRAPHQL_LOG_RESPONSE') === '0') {
      return;
    }

    if (errorCount) {
      logger.warn('executeRequest', 'GraphQL response has errors', {
        status,
        duration,
        errorCount,
        operationId
      });
    } else {
      logger.info('RESPONSE: renia-graphql-client', `${operationId || 'query'}`, {
        status,
        duration
      });
    }
  }

  logError(operationId: string | undefined, method: string, endpoint: string, duration: number, error: Error): void {
    logger.error('executeRequest', 'GraphQL request failed', {
      method,
      endpoint,
      duration,
      operationId,
      errorMessage: error.message,
      errorName: error.name
    });
  }
}

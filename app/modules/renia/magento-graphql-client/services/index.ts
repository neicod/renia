// @env: mixed

import type { HttpClient, GraphQLLogger } from 'renia-graphql-client';
import { MagentoHttpClient } from '../transport/MagentoHttpClient';
import { MagentoGraphQLLogger } from '../logging/MagentoGraphQLLogger';

let cachedHttpClient: HttpClient | null = null;
let cachedGraphQLLogger: GraphQLLogger | null = null;

/**
 * Get or create the Magento HTTP client singleton.
 *
 * Magento-specific HTTP client that handles:
 * - Magento Host header (if MAGENTO_HOST_HEADER is set)
 * - Proxy endpoint resolution
 * - Magento-specific error handling
 */
export const getMagentoHttpClient = (): HttpClient => {
  if (cachedHttpClient) {
    return cachedHttpClient;
  }

  const getEnv = (key: string) =>
    typeof process !== 'undefined' && process.env ? process.env[key] : undefined;

  const hostHeader = getEnv('MAGENTO_HOST_HEADER');
  cachedHttpClient = new MagentoHttpClient(hostHeader);

  return cachedHttpClient;
};

/**
 * Get or create the Magento GraphQL logger singleton.
 *
 * Magento-specific logger that adds Magento context to all log entries.
 */
export const getMagentoGraphQLLogger = (): GraphQLLogger => {
  if (cachedGraphQLLogger) {
    return cachedGraphQLLogger;
  }

  cachedGraphQLLogger = new MagentoGraphQLLogger();
  return cachedGraphQLLogger;
};

/**
 * Reset cached clients (for testing purposes).
 */
export const resetMagentoClients = (): void => {
  cachedHttpClient = null;
  cachedGraphQLLogger = null;
};

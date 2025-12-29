// @env: mixed
import type { GraphQLRequest } from 'renia-graphql-client';
import { GraphQLRequestExecutor, DefaultGraphQLLogger } from 'renia-graphql-client';
import { readMagentoEndpoint } from './utils/magentoEndpoint.js';
import { getMagentoHttpClient, getMagentoGraphQLLogger } from './services/index.js';
import { getLogger } from 'renia-logger';

const logger = getLogger();

type CreateParams = Omit<GraphQLRequest, 'endpoint'>;

const resolveEndpoint = (): string => {
  const endpoint = readMagentoEndpoint();
  if (!endpoint) {
    logger.error('MagentoGraphQLRequestFactory', 'Magento GraphQL endpoint not configured');
    throw new Error('Magento GraphQL endpoint is not configured');
  }
  return endpoint;
};

const createRequest = (params: CreateParams): GraphQLRequest => {
  const { method = 'POST', headers, variables, payload, auth, timeoutMs, operationId } = params;

  return {
    endpoint: resolveEndpoint(),
    method,
    headers,
    variables,
    payload,
    auth,
    timeoutMs,
    operationId
  };
};

/**
 * Get a pre-configured executor for Magento GraphQL requests.
 *
 * This executor uses:
 * - MagentoHttpClient (Magento-specific HTTP handling)
 * - MagentoGraphQLLogger (Magento-specific logging)
 * - Default payload builder and response handler
 *
 * @example
 * const executor = MagentoGraphQLRequestFactory.createExecutor();
 * const response = await executor.execute(request);
 */
const createExecutor = () => {
  return new GraphQLRequestExecutor({
    httpClient: getMagentoHttpClient(),
    logger: getMagentoGraphQLLogger()
  });
};

export const MagentoGraphQLRequestFactory = {
  getEndpoint: resolveEndpoint,
  create: createRequest,
  createExecutor
};

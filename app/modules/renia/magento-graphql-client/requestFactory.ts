// @env: mixed
import type { GraphQLRequest } from 'renia-graphql-client';
import { readMagentoEndpoint } from './utils/magentoEndpoint';
import { getLogger } from 'renia-logger';

const logger = getLogger();

type CreateParams = Omit<GraphQLRequest, 'endpoint'>;

const getEnv = (key: string): string | undefined =>
  typeof process !== 'undefined' && process.env ? process.env[key] : undefined;

const resolveEndpoint = () => {
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

export const MagentoGraphQLRequestFactory = {
  getEndpoint: resolveEndpoint,
  create: createRequest
};

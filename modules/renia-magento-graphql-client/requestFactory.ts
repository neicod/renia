// @env: mixed
import type { GraphQLRequest } from 'renia-graphql-client';
import { readMagentoEndpoint } from './utils/magentoEndpoint';

type CreateParams = Omit<GraphQLRequest, 'endpoint'>;

const resolveEndpoint = () => {
  const endpoint = readMagentoEndpoint();
  if (!endpoint) {
    throw new Error('Magento GraphQL endpoint is not configured');
  }
  return endpoint;
};

const createRequest = (params: CreateParams): GraphQLRequest => {
  const { method = 'POST', headers, variables, payload, auth, timeoutMs } = params;
  return {
    endpoint: resolveEndpoint(),
    method,
    headers,
    variables,
    payload,
    auth,
    timeoutMs
  };
};

export const MagentoGraphQLRequestFactory = {
  getEndpoint: resolveEndpoint,
  create: createRequest
};

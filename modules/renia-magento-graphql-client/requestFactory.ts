// @env: mixed
import type { GraphQLRequest } from 'renia-graphql-client';
import { readMagentoEndpoint } from './utils/magentoEndpoint';

type CreateParams = Omit<GraphQLRequest, 'endpoint'>;

export class MagentoGraphQLRequestFactory {
  private readonly endpoint: string;

  constructor() {
    const resolved = readMagentoEndpoint();
    if (!resolved) {
      throw new Error('Magento GraphQL endpoint is not configured');
    }
    this.endpoint = resolved;
  }

  getEndpoint() {
    return this.endpoint;
  }

  create(params: CreateParams): GraphQLRequest {
    const { method = 'POST', headers, variables, payload, auth, timeoutMs } = params;
    return {
      endpoint: this.endpoint,
      method,
      headers,
      variables,
      payload,
      auth,
      timeoutMs
    };
  }
}

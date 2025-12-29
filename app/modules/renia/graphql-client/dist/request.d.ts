import type { GraphQLRequest } from './types';
import type { HttpClient } from './transport/HttpClient';
import type { GraphQLLogger } from './logging/GraphQLLogger';
/**
 * Execute GraphQL request with dependency injection support.
 *
 * @param req GraphQL request configuration
 * @param httpClient Optional HTTP client (uses default if not provided)
 * @param graphQLLogger Optional logger (uses DefaultGraphQLLogger if not provided)
 * @returns GraphQL response
 *
 * @example
 * const response = await executeRequest({
 *   endpoint: 'https://api.example.com/graphql',
 *   payload: new QueryBuilder('query')...
 * });
 *
 * @example With custom dependencies
 * const response = await executeRequest(
 *   { endpoint: '...', payload: '...' },
 *   new AxiosHttpClient(),
 *   new CustomGraphQLLogger()
 * );
 */
export declare const executeRequest: (req: GraphQLRequest, httpClient?: HttpClient, graphQLLogger?: GraphQLLogger) => Promise<import("./types").GraphQLResponse>;
//# sourceMappingURL=request.d.ts.map
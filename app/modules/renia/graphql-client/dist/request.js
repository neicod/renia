import { getHttpClient } from './transport/HttpClientFactory';
import { DefaultGraphQLLogger } from './logging/DefaultGraphQLLogger';
import { GraphQLRequestExecutor } from './request/GraphQLRequestExecutor';
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
export const executeRequest = async (req, httpClient, graphQLLogger) => {
    const client = httpClient ?? getHttpClient();
    const logger = graphQLLogger ?? new DefaultGraphQLLogger();
    const executor = new GraphQLRequestExecutor({
        httpClient: client,
        logger
    });
    return executor.execute(req);
};

import type { GraphQLPayload, GraphQLRequest } from 'renia-graphql-client/types';
export type GraphQLHeaderAugmenter = (headers: Record<string, string>) => void;
export type GraphQLQueryAugmentResult = void | GraphQLPayload | {
    payload?: GraphQLPayload;
    variables?: GraphQLRequest['variables'];
};
export type GraphQLQueryAugmenter = (payload: GraphQLPayload, context: {
    operationId?: string;
    variables?: GraphQLRequest['variables'];
    request: GraphQLRequest;
}) => GraphQLQueryAugmentResult;
export type GraphQLAuthErrorHandler = (error: Error, context: {
    request: GraphQLRequest;
}) => void;
export declare const registerGraphQLHeaderAugmenter: (augmenter: GraphQLHeaderAugmenter) => void;
export declare const getRegisteredGraphQLHeaderAugmenters: () => GraphQLHeaderAugmenter[];
export declare const registerGraphQLQueryAugmenter: (augmenter: GraphQLQueryAugmenter) => void;
export declare const getRegisteredGraphQLQueryAugmenters: () => GraphQLQueryAugmenter[];
export declare const registerGraphQLAuthErrorHandler: (handler: GraphQLAuthErrorHandler) => void;
type ExecuteOptions = {
    augmenters?: GraphQLHeaderAugmenter[];
    headerAugmenters?: GraphQLHeaderAugmenter[];
    queryAugmenters?: GraphQLQueryAugmenter[];
};
export declare const executeGraphQLRequest: (request: GraphQLRequest, options?: ExecuteOptions) => Promise<import("renia-graphql-client").GraphQLResponse<any>>;
declare const _default: {
    registerGraphQLHeaderAugmenter: (augmenter: GraphQLHeaderAugmenter) => void;
    registerGraphQLQueryAugmenter: (augmenter: GraphQLQueryAugmenter) => void;
    registerGraphQLAuthErrorHandler: (handler: GraphQLAuthErrorHandler) => void;
    executeGraphQLRequest: (request: GraphQLRequest, options?: ExecuteOptions) => Promise<import("renia-graphql-client").GraphQLResponse<any>>;
};
export default _default;
//# sourceMappingURL=graphqlClient.d.ts.map
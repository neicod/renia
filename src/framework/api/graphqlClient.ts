// @env: mixed
import { executeRequest } from 'renia-graphql-client';
import type { GraphQLPayload, GraphQLRequest } from 'renia-graphql-client/types';

export type GraphQLHeaderAugmenter = (headers: Record<string, string>) => void;

export type GraphQLQueryAugmentResult =
  | void
  | GraphQLPayload
  | {
      payload?: GraphQLPayload;
      variables?: GraphQLRequest['variables'];
    };

export type GraphQLQueryAugmenter = (
  payload: GraphQLPayload,
  context: {
    operationId?: string;
    variables?: GraphQLRequest['variables'];
    request: GraphQLRequest;
  }
) => GraphQLQueryAugmentResult;

export type GraphQLAuthErrorHandler = (error: Error, context: { request: GraphQLRequest }) => void;

const globalHeaderAugmenters = new Set<GraphQLHeaderAugmenter>();
const globalQueryAugmenters = new Set<GraphQLQueryAugmenter>();
const authErrorHandlers = new Set<GraphQLAuthErrorHandler>();

export const registerGraphQLHeaderAugmenter = (augmenter: GraphQLHeaderAugmenter) => {
  if (typeof augmenter !== 'function') return;
  globalHeaderAugmenters.add(augmenter);
};

export const getRegisteredGraphQLHeaderAugmenters = (): GraphQLHeaderAugmenter[] => [
  ...globalHeaderAugmenters
];

export const registerGraphQLQueryAugmenter = (augmenter: GraphQLQueryAugmenter) => {
  if (typeof augmenter !== 'function') return;
  globalQueryAugmenters.add(augmenter);
};

export const getRegisteredGraphQLQueryAugmenters = (): GraphQLQueryAugmenter[] => [
  ...globalQueryAugmenters
];

export const registerGraphQLAuthErrorHandler = (handler: GraphQLAuthErrorHandler) => {
  if (typeof handler !== 'function') return;
  authErrorHandlers.add(handler);
};

const notifyAuthErrorHandlers = (error: Error, request: GraphQLRequest) => {
  authErrorHandlers.forEach((handler) => {
    try {
      handler(error, { request });
    } catch (notifyError) {
      console.error('[GraphQL][auth] handler failed', notifyError);
    }
  });
};

const isAuthError = (error: unknown): error is Error =>
  error instanceof Error && error.message?.startsWith('Auth error:');

const applyHeaderAugmenters = (
  headers: Record<string, string> | undefined,
  augmenters: GraphQLHeaderAugmenter[]
) => {
  if (!augmenters.length) return headers ?? {};
  const next: Record<string, string> = { ...(headers ?? {}) };
  augmenters.forEach((augmenter) => {
    try {
      augmenter(next);
    } catch (error) {
      console.error('[GraphQL][augmenter] Failed to apply header augmenter', error);
    }
  });
  return next;
};

const applyQueryAugmenters = (
  payload: GraphQLPayload,
  variables: GraphQLRequest['variables'],
  augmenters: GraphQLQueryAugmenter[],
  request: GraphQLRequest
) => {
  if (!augmenters.length) {
    return { payload, variables };
  }

  let currentPayload = payload;
  let currentVariables = variables;

  augmenters.forEach((augmenter) => {
    try {
      const result = augmenter(currentPayload, {
        operationId: request.operationId,
        variables: currentVariables,
        request
      });
      if (!result) return;
      if (typeof result === 'object' && ('payload' in result || 'variables' in result)) {
        if (result.payload) currentPayload = result.payload;
        if ('variables' in result) {
          currentVariables = result.variables;
        }
      } else {
        currentPayload = result as GraphQLPayload;
      }
    } catch (error) {
      console.error('[GraphQL][augmenter] Failed to apply query augmenter', error);
    }
  });

  return { payload: currentPayload, variables: currentVariables };
};

type ExecuteOptions = {
  augmenters?: GraphQLHeaderAugmenter[];
  headerAugmenters?: GraphQLHeaderAugmenter[];
  queryAugmenters?: GraphQLQueryAugmenter[];
};

export const executeGraphQLRequest = async (
  request: GraphQLRequest,
  options: ExecuteOptions = {}
) => {
  const runtimeHeaderAugmenters = getRegisteredGraphQLHeaderAugmenters();
  const runtimeQueryAugmenters = getRegisteredGraphQLQueryAugmenters();

  const optionHeaderAugmenters = [
    ...(options.headerAugmenters ?? []),
    ...(options.augmenters ?? [])
  ];
  const headerAugmenters = [...runtimeHeaderAugmenters, ...optionHeaderAugmenters];
  const headers = applyHeaderAugmenters(request.headers, headerAugmenters);

  const optionQueryAugmenters = options.queryAugmenters ?? [];
  const queryAugmenters = [...runtimeQueryAugmenters, ...optionQueryAugmenters];
  const { payload, variables } = applyQueryAugmenters(
    request.payload,
    request.variables,
    queryAugmenters,
    request
  );

  try {
    return await executeRequest({ ...request, headers, variables, payload });
  } catch (error) {
    if (isAuthError(error)) {
      notifyAuthErrorHandlers(error, request);
    }
    throw error;
  }
};

export default {
  registerGraphQLHeaderAugmenter,
  registerGraphQLQueryAugmenter,
  registerGraphQLAuthErrorHandler,
  executeGraphQLRequest
};

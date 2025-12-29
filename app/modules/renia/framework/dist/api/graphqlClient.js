// @env: mixed
import { executeRequest } from 'renia-graphql-client';
const globalHeaderAugmenters = new Set();
const globalQueryAugmenters = new Set();
const authErrorHandlers = new Set();
export const registerGraphQLHeaderAugmenter = (augmenter) => {
    if (typeof augmenter !== 'function')
        return;
    globalHeaderAugmenters.add(augmenter);
};
export const getRegisteredGraphQLHeaderAugmenters = () => [
    ...globalHeaderAugmenters
];
export const registerGraphQLQueryAugmenter = (augmenter) => {
    if (typeof augmenter !== 'function')
        return;
    globalQueryAugmenters.add(augmenter);
};
export const getRegisteredGraphQLQueryAugmenters = () => [
    ...globalQueryAugmenters
];
export const registerGraphQLAuthErrorHandler = (handler) => {
    if (typeof handler !== 'function')
        return;
    authErrorHandlers.add(handler);
};
const notifyAuthErrorHandlers = (error, request) => {
    authErrorHandlers.forEach((handler) => {
        try {
            handler(error, { request });
        }
        catch (notifyError) {
            console.error('[GraphQL][auth] handler failed', notifyError);
        }
    });
};
const isAuthError = (error) => error instanceof Error && error.message?.startsWith('Auth error:');
const applyHeaderAugmenters = (headers, augmenters) => {
    if (!augmenters.length)
        return headers ?? {};
    const next = { ...(headers ?? {}) };
    augmenters.forEach((augmenter) => {
        try {
            augmenter(next);
        }
        catch (error) {
            console.error('[GraphQL][augmenter] Failed to apply header augmenter', error);
        }
    });
    return next;
};
const applyQueryAugmenters = (payload, variables, augmenters, request) => {
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
            if (!result)
                return;
            if (typeof result === 'object' && ('payload' in result || 'variables' in result)) {
                if (result.payload)
                    currentPayload = result.payload;
                if ('variables' in result) {
                    currentVariables = result.variables;
                }
            }
            else {
                currentPayload = result;
            }
        }
        catch (error) {
            console.error('[GraphQL][augmenter] Failed to apply query augmenter', error);
        }
    });
    return { payload: currentPayload, variables: currentVariables };
};
export const executeGraphQLRequest = async (request, options = {}) => {
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
    const { payload, variables } = applyQueryAugmenters(request.payload, request.variables, queryAugmenters, request);
    try {
        return await executeRequest({ ...request, headers, variables, payload });
    }
    catch (error) {
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

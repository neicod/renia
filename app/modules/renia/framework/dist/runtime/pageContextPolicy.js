// @env: mixed
/**
 * Decide whether CSR should call `/api/page-context` for the current navigation.
 *
 * Rules:
 * - on mount: only when bootstrap context is missing/suspicious (shouldRevalidateOnMount)
 * - on navigation: only for catch-all routes (`/*`) that need dynamic URL resolution (e.g. Magento urlResolver)
 */
export const shouldFetchPageContextPayload = (args) => {
    const activePath = typeof args.activePath === 'string' ? args.activePath : null;
    const isCatchAll = activePath === '/*';
    if (args.isFirstEffect)
        return Boolean(args.shouldRevalidateOnMount);
    return Boolean(isCatchAll);
};
export default {
    shouldFetchPageContextPayload
};

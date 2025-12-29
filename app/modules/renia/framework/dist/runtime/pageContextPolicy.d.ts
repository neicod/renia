export type PageContextFetchPolicyArgs = {
    isFirstEffect: boolean;
    shouldRevalidateOnMount: boolean;
    activePath: string | null;
};
/**
 * Decide whether CSR should call `/api/page-context` for the current navigation.
 *
 * Rules:
 * - on mount: only when bootstrap context is missing/suspicious (shouldRevalidateOnMount)
 * - on navigation: only for catch-all routes (`/*`) that need dynamic URL resolution (e.g. Magento urlResolver)
 */
export declare const shouldFetchPageContextPayload: (args: PageContextFetchPolicyArgs) => boolean;
declare const _default: {
    shouldFetchPageContextPayload: (args: PageContextFetchPolicyArgs) => boolean;
};
export default _default;
//# sourceMappingURL=pageContextPolicy.d.ts.map
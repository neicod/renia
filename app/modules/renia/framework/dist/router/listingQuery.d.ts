export type ListingQueryDefaults = {
    page?: number;
    pageSize?: number;
    sort?: string;
};
export type ListingQueryState = {
    page: number;
    pageSize?: number;
    sort: string;
};
export declare const readListingQueryState: (search: string | null | undefined, defaults?: ListingQueryDefaults) => ListingQueryState;
type ApplyListingQueryArgs = {
    page?: number;
    pageSize?: number;
    sort?: string;
};
export declare const applyListingQuery: (search: string | null | undefined, next: ApplyListingQueryArgs, defaults?: ListingQueryDefaults) => string;
/**
 * Canonicalizes listing query params:
 * - de-duplicates keys
 * - moves aliases to canonical keys
 * - removes default values (page=1, sort=default, pageSize=default)
 * - keeps unrelated params intact
 */
export declare const normalizeListingQuery: (search: string | null | undefined, defaults?: ListingQueryDefaults) => string;
/**
 * Canonicalize search query key: we use `q`. Legacy `query` is removed.
 * If `query` exists and `q` is missing, its value is moved to `q`.
 */
export declare const normalizeSearchTermKey: (search: string | null | undefined) => string;
declare const _default: {
    readListingQueryState: (search: string | null | undefined, defaults?: ListingQueryDefaults) => ListingQueryState;
    applyListingQuery: (search: string | null | undefined, next: ApplyListingQueryArgs, defaults?: ListingQueryDefaults) => string;
    normalizeListingQuery: (search: string | null | undefined, defaults?: ListingQueryDefaults) => string;
    normalizeSearchTermKey: (search: string | null | undefined) => string;
};
export default _default;
//# sourceMappingURL=listingQuery.d.ts.map
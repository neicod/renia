export declare const stripLeadingSlashes: (value: string) => string;
export declare const stripTrailingSlashes: (value: string) => string;
/**
 * Normalizes an internal app href:
 * - ensures exactly one leading slash
 * - collapses multiple leading slashes
 * - preserves query/hash (if present)
 *
 * Examples:
 * - "a/b" -> "/a/b"
 * - "/a/b" -> "/a/b"
 * - "///a/b?x=1" -> "/a/b?x=1"
 */
export declare const toAbsolutePath: (pathLike: string | null | undefined) => string | null;
/**
 * De-duplicates query parameters (last value wins) and returns a normalized search string.
 * Keeps key order based on the last occurrence in the input.
 */
export declare const dedupeSearch: (search: string | null | undefined) => string;
declare const _default: {
    toAbsolutePath: (pathLike: string | null | undefined) => string | null;
    dedupeSearch: (search: string | null | undefined) => string;
    stripLeadingSlashes: (value: string) => string;
    stripTrailingSlashes: (value: string) => string;
};
export default _default;
//# sourceMappingURL=paths.d.ts.map
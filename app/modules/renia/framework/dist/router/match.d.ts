export type MatchResult<T> = {
    entry: T | null;
    index: number | null;
    params: Record<string, string>;
};
/**
 * Matches routes using React Router's ranking algorithm (same as <Routes/>),
 * while preserving the input order for tie-breaks.
 *
 * Use this whenever you need server/client consistency for "active route" selection
 * (handlers, contexts, meta selection).
 */
export declare const matchBestRoute: <T extends {
    path: string;
}>(routes: T[], pathname: string) => MatchResult<T>;
declare const _default: {
    matchBestRoute: <T extends {
        path: string;
    }>(routes: T[], pathname: string) => MatchResult<T>;
};
export default _default;
//# sourceMappingURL=match.d.ts.map
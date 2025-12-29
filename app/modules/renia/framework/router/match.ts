// @env: mixed
import { matchRoutes } from 'react-router-dom';

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
export const matchBestRoute = <T extends { path: string }>(routes: T[], pathname: string): MatchResult<T> => {
  const routeObjects = routes.map((r, i) => ({ path: r.path, id: String(i) })) as any;
  const matches = matchRoutes(routeObjects, { pathname });
  const last = matches?.length ? matches[matches.length - 1] : null;
  const idRaw = last?.route ? (last.route as any).id : null;
  const index = typeof idRaw === 'string' ? Number(idRaw) : null;
  const safeIndex = Number.isFinite(index) ? (index as number) : null;
  const entry = safeIndex !== null ? routes[safeIndex] ?? null : null;
  const params = (last?.params ?? {}) as Record<string, string>;
  return { entry, index: safeIndex, params };
};

export default {
  matchBestRoute
};


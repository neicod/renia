// @env: mixed
import { dedupeSearch } from './paths';
const DEFAULTS_FALLBACK = {
    page: 1,
    pageSize: 0,
    sort: 'relevance'
};
const parsePositiveInt = (raw) => {
    if (raw === null || raw === undefined)
        return null;
    const n = Number(raw);
    if (!Number.isFinite(n))
        return null;
    const int = Math.floor(n);
    if (int < 1)
        return null;
    return int;
};
const getFirst = (params, keys) => {
    for (const key of keys) {
        const v = params.get(key);
        if (v !== null)
            return v;
    }
    return null;
};
export const readListingQueryState = (search, defaults = {}) => {
    const d = { ...DEFAULTS_FALLBACK, ...(defaults ?? {}) };
    const normalizedSearch = dedupeSearch(search);
    const params = new URLSearchParams(normalizedSearch.startsWith('?') ? normalizedSearch.slice(1) : normalizedSearch);
    const pageRaw = getFirst(params, ['page', 'p']);
    const page = parsePositiveInt(pageRaw) ?? d.page;
    const pageSizeRaw = getFirst(params, ['pageSize', 'page_size', 'limit', 'ps']);
    const pageSize = parsePositiveInt(pageSizeRaw);
    const sort = (getFirst(params, ['sort', 's']) ?? d.sort).trim() || d.sort;
    return {
        page,
        pageSize: pageSize ?? undefined,
        sort
    };
};
export const applyListingQuery = (search, next, defaults = {}) => {
    const d = { ...DEFAULTS_FALLBACK, ...(defaults ?? {}) };
    const normalizedSearch = dedupeSearch(search);
    const params = new URLSearchParams(normalizedSearch.startsWith('?') ? normalizedSearch.slice(1) : normalizedSearch);
    // Drop aliases (we always write canonical keys).
    params.delete('p');
    params.delete('page_size');
    params.delete('limit');
    params.delete('ps');
    params.delete('s');
    if (next.page !== undefined) {
        const page = Number.isFinite(next.page) ? Math.max(1, Math.floor(next.page)) : d.page;
        if (page === d.page)
            params.delete('page');
        else
            params.set('page', String(page));
    }
    if (next.pageSize !== undefined) {
        const pageSize = Number.isFinite(next.pageSize) ? Math.max(1, Math.floor(next.pageSize)) : d.pageSize;
        if (!pageSize || pageSize === d.pageSize)
            params.delete('pageSize');
        else
            params.set('pageSize', String(pageSize));
    }
    if (next.sort !== undefined) {
        const sort = String(next.sort ?? '').trim() || d.sort;
        if (sort === d.sort)
            params.delete('sort');
        else
            params.set('sort', sort);
    }
    const out = params.toString();
    return out ? `?${out}` : '';
};
/**
 * Canonicalizes listing query params:
 * - de-duplicates keys
 * - moves aliases to canonical keys
 * - removes default values (page=1, sort=default, pageSize=default)
 * - keeps unrelated params intact
 */
export const normalizeListingQuery = (search, defaults = {}) => {
    const d = { ...DEFAULTS_FALLBACK, ...(defaults ?? {}) };
    const normalizedSearch = dedupeSearch(search);
    const params = new URLSearchParams(normalizedSearch.startsWith('?') ? normalizedSearch.slice(1) : normalizedSearch);
    const state = readListingQueryState(normalizedSearch, d);
    // Remove any existing listing keys (canonical + aliases).
    params.delete('page');
    params.delete('p');
    params.delete('pageSize');
    params.delete('page_size');
    params.delete('limit');
    params.delete('ps');
    params.delete('sort');
    params.delete('s');
    if (state.page !== d.page) {
        params.set('page', String(state.page));
    }
    if (state.pageSize && state.pageSize !== d.pageSize) {
        params.set('pageSize', String(state.pageSize));
    }
    if (state.sort && state.sort !== d.sort) {
        params.set('sort', state.sort);
    }
    const out = params.toString();
    return out ? `?${out}` : '';
};
/**
 * Canonicalize search query key: we use `q`. Legacy `query` is removed.
 * If `query` exists and `q` is missing, its value is moved to `q`.
 */
export const normalizeSearchTermKey = (search) => {
    const normalizedSearch = dedupeSearch(search);
    const params = new URLSearchParams(normalizedSearch.startsWith('?') ? normalizedSearch.slice(1) : normalizedSearch);
    const q = params.get('q');
    const legacy = params.get('query');
    if ((!q || !q.trim()) && legacy && legacy.trim()) {
        params.set('q', legacy.trim());
    }
    params.delete('query');
    const out = params.toString();
    return out ? `?${out}` : '';
};
export default {
    readListingQueryState,
    applyListingQuery,
    normalizeListingQuery,
    normalizeSearchTermKey
};

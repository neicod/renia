// @env: mixed
const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);
export const stripLeadingSlashes = (value) => value.replace(/^\/+/, '');
export const stripTrailingSlashes = (value) => value.replace(/\/+$/, '');
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
export const toAbsolutePath = (pathLike) => {
    const raw = String(pathLike ?? '').trim();
    if (!raw)
        return null;
    if (isAbsoluteUrl(raw)) {
        try {
            const u = new URL(raw);
            return `${u.pathname || '/'}${u.search || ''}${u.hash || ''}`;
        }
        catch {
            return raw;
        }
    }
    const match = raw.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
    const pathnameRaw = match?.[1] ?? raw;
    const search = match?.[2] ?? '';
    const hash = match?.[3] ?? '';
    const pathnameTrimmed = stripLeadingSlashes(pathnameRaw.trim());
    const pathname = pathnameTrimmed ? `/${pathnameTrimmed}` : '/';
    return `${pathname}${search}${hash}`;
};
/**
 * De-duplicates query parameters (last value wins) and returns a normalized search string.
 * Keeps key order based on the last occurrence in the input.
 */
export const dedupeSearch = (search) => {
    const raw = String(search ?? '');
    if (!raw || raw === '?')
        return '';
    const qs = raw.startsWith('?') ? raw.slice(1) : raw;
    if (!qs)
        return '';
    const parsed = new URLSearchParams(qs);
    // URLSearchParams keeps duplicates; last wins for get(), but toString() keeps all.
    // Rebuild with last occurrence per key, preserving "last key order".
    const lastValueByKey = new Map();
    const keyOrder = [];
    for (const [key, value] of parsed.entries()) {
        if (lastValueByKey.has(key)) {
            const idx = keyOrder.indexOf(key);
            if (idx >= 0)
                keyOrder.splice(idx, 1);
        }
        keyOrder.push(key);
        lastValueByKey.set(key, value);
    }
    const out = new URLSearchParams();
    for (const key of keyOrder) {
        const val = lastValueByKey.get(key);
        if (val !== undefined)
            out.set(key, val);
    }
    const normalized = out.toString();
    return normalized ? `?${normalized}` : '';
};
export default {
    toAbsolutePath,
    dedupeSearch,
    stripLeadingSlashes,
    stripTrailingSlashes
};

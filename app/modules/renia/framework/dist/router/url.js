// @env: mixed
const normalizeBasePath = (basePath) => {
    const raw = (basePath ?? '').trim();
    if (!raw)
        return '';
    const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
    return withSlash.endsWith('/') ? withSlash.slice(0, -1) : withSlash;
};
const normalizePath = (path) => {
    const raw = (path ?? '').trim();
    if (!raw)
        return '/';
    return raw.startsWith('/') ? raw : `/${raw}`;
};
export const getBootstrapBasePath = () => {
    if (typeof window !== 'undefined') {
        const bootstrap = window.__APP_BOOTSTRAP__ ?? {};
        return normalizeBasePath(bootstrap.basePath);
    }
    return '';
};
/**
 * Prefix `path` with `basePath` (e.g. "/pl") for manual URL building.
 * If you're using React Router <Link>, prefer relying on `basename`.
 */
export const withBasePath = (path, basePath) => {
    const bp = normalizeBasePath(basePath ?? getBootstrapBasePath());
    const p = normalizePath(path);
    if (!bp)
        return p;
    if (p === '/')
        return `${bp}/`;
    return `${bp}${p}`;
};
export default {
    getBootstrapBasePath,
    withBasePath
};

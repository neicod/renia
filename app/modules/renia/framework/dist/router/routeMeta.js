// @env: mixed
const isPlainObject = (value) => {
    if (!value || typeof value !== 'object')
        return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
};
export const isRedirectRouteMeta = (meta) => {
    if (!meta || typeof meta !== 'object')
        return false;
    return (meta.type === 'redirect' &&
        typeof meta.redirectTo === 'string' &&
        typeof meta.redirectCode === 'number');
};
export const normalizeRouteMeta = (input) => {
    const raw = isPlainObject(input) ? { ...input } : {};
    if (typeof raw.type !== 'string')
        delete raw.type;
    if (typeof raw.layout !== 'string')
        delete raw.layout;
    if (typeof raw.__ssrPath !== 'string')
        delete raw.__ssrPath;
    const type = typeof raw.type === 'string' ? String(raw.type) : undefined;
    if (type === 'redirect') {
        const redirectTo = raw.redirectTo;
        const redirectCode = raw.redirectCode;
        const ok = typeof redirectTo === 'string' && !!redirectTo && typeof redirectCode === 'number' && !!redirectCode;
        if (!ok) {
            // Invalid redirect meta would break SSR/CSR navigation; downgrade to a safe default.
            delete raw.redirectTo;
            delete raw.redirectCode;
            raw.type = 'default';
        }
    }
    if (type === 'category' && 'category' in raw) {
        const category = raw.category;
        if (category !== null && category !== undefined && !isPlainObject(category)) {
            delete raw.category;
        }
    }
    return raw;
};
export default {
    normalizeRouteMeta,
    isRedirectRouteMeta
};

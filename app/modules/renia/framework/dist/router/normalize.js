const isEqual = (a, b) => {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    }
    catch {
        return false;
    }
};
export const normalizeRoute = (route) => {
    if (!route || typeof route !== 'object')
        return null;
    if (typeof route.path !== 'string' || !route.path.trim())
        return null;
    if (!route.component && !route.componentPath)
        return null;
    const normalized = {
        path: route.path,
        componentPath: route.componentPath,
        component: route.component,
        handler: route.handler,
        redirect: route.redirect,
        status: route.status,
        priority: route.priority ?? 0,
        contexts: Array.isArray(route.contexts) ? route.contexts.slice() : undefined,
        guards: Array.isArray(route.guards) ? route.guards.slice() : undefined,
        meta: route.meta && typeof route.meta === 'object' ? route.meta : undefined
    };
    return normalized;
};
export const mergeRoutes = (entries) => {
    const seen = new Map();
    for (const entry of entries) {
        const key = `${entry.path}::${entry.priority ?? 0}`;
        if (!seen.has(key)) {
            seen.set(key, entry);
        }
        else {
            const existing = seen.get(key);
            if (!isEqual(existing, entry)) {
                console.error(`Kolizja tras dla "${entry.path}" o priorytecie ${entry.priority ?? 0} (moduły: ${existing.module} / ${entry.module}) — pomijam duplikat.`);
            }
        }
    }
    const unique = Array.from(seen.values());
    unique.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    return unique;
};

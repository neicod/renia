import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @env: mixed
import React from 'react';
import { Route, Routes, matchRoutes, useLocation, useNavigate } from 'react-router-dom';
import { registerComponents, resolveComponentEntry } from '../registry/componentRegistry';
import { AppEnvironmentProvider } from './AppEnvContext';
import { PageContextProvider } from './PageContext';
import { LayoutShell, LayoutTreeBuilder, buildRegions, ExtensionsRegistry, validateLayoutArtifacts } from '@renia/framework/layout';
import { I18nProvider } from 'renia-i18n/context/I18nProvider';
import { loadInterceptorsClient } from '@renia/framework/interceptors/loadInterceptorsClient';
import { registerProductTypeComponentStrategy } from '@renia/framework/runtime/productTypeStrategies';
import { listRegisteredComponents } from '@renia/framework/registry/componentRegistry';
import { isRedirectRouteMeta, normalizeRouteMeta } from '@renia/framework/router/routeMeta';
import { dedupeSearch } from '@renia/framework/router/paths';
import { getClientInstanceId, getPageContextPayload } from './pageContextClient';
import { shouldFetchPageContextPayload } from './pageContextPolicy';
import { RenderedLocationProvider } from '@renia/framework/router/renderedLocation';
const LISTING_QUERY_KEYS = new Set(['page', 'p', 'pageSize', 'page_size', 'limit', 'ps', 'sort', 's']);
const normalizeNonListingSearch = (search) => {
    const normalized = dedupeSearch(search ?? '');
    const params = new URLSearchParams(normalized.startsWith('?') ? normalized.slice(1) : normalized);
    for (const key of LISTING_QUERY_KEYS) {
        params.delete(key);
    }
    const entries = Array.from(params.entries()).sort(([aKey, aVal], [bKey, bVal]) => {
        const keyCompare = aKey.localeCompare(bKey);
        return keyCompare !== 0 ? keyCompare : aVal.localeCompare(bVal);
    });
    return entries.map(([key, value]) => `${key}=${value}`).join('&');
};
const isListingQueryOnlyChange = (prevSearch, nextSearch) => normalizeNonListingSearch(prevSearch) === normalizeNonListingSearch(nextSearch);
const HomePage = () => (_jsxs("section", { className: "card", children: [_jsx("h1", { style: { margin: '0 0 0.5rem' }, children: "React SSR starter" }), _jsx("p", { style: { margin: 0 }, children: "Ten widok jest budowany w oparciu o dynamiczne trasy i sloty z modu\u0142\u00F3w." })] }));
const AboutPage = () => (_jsxs("section", { className: "card", children: [_jsx("h1", { style: { margin: '0 0 0.5rem' }, children: "O projekcie" }), _jsx("p", { style: { margin: 0 }, children: "Dodaj swoje widoki, logik\u0119 routingu i integracje API wed\u0142ug potrzeb." })] }));
const MissingComponent = () => null;
registerComponents({
    HomePage,
    AboutPage
});
export const AppRoot = ({ bootstrap, runtime = 'client' }) => {
    const resolveComponent = (entry) => resolveComponentEntry(entry, MissingComponent);
    const location = useLocation();
    const navigate = useNavigate();
    const [displayLocation, setDisplayLocation] = React.useState(location);
    const [pageContext, setPageContext] = React.useState(bootstrap.pageContext);
    const [regions, setRegions] = React.useState(bootstrap.regions ?? {});
    const [extensions, setExtensions] = React.useState(bootstrap.extensions ?? {});
    const [activeContexts, setActiveContexts] = React.useState((bootstrap.contexts ?? []).slice());
    const [activeRouteMeta, setActiveRouteMeta] = React.useState(() => {
        const routes = [
            { path: '/', component: 'HomePage', contexts: [] },
            { path: '/about', component: 'AboutPage', contexts: [] },
            ...(bootstrap.routes ?? [])
        ];
        const matches = matchRoutes(routes.map((r) => ({ path: r.path })), location);
        const last = matches?.length ? matches[matches.length - 1] : undefined;
        const activePath = last?.route?.path;
        const entry = routes.find((r) => r.path === activePath);
        return entry?.meta ? normalizeRouteMeta(entry.meta) : undefined;
    });
    const lastLayoutKeyRef = React.useRef('');
    const navSeqRef = React.useRef(0);
    const didMountRef = React.useRef(false);
    React.useEffect(() => {
        setPageContext(bootstrap.pageContext);
        setRegions((bootstrap.regions ?? {}));
        setExtensions((bootstrap.extensions ?? {}));
        setActiveContexts((bootstrap.contexts ?? []).slice());
        const routes = [
            { path: '/', component: 'HomePage', contexts: [] },
            { path: '/about', component: 'AboutPage', contexts: [] },
            ...(bootstrap.routes ?? [])
        ];
        const matches = matchRoutes(routes.map((r) => ({ path: r.path })), location);
        const last = matches?.length ? matches[matches.length - 1] : undefined;
        const activePath = last?.route?.path;
        const entry = routes.find((r) => r.path === activePath);
        setActiveRouteMeta(entry?.meta ? normalizeRouteMeta(entry.meta) : undefined);
        setDisplayLocation(location);
    }, [bootstrap.pageContext, bootstrap.regions, bootstrap.extensions, bootstrap.contexts, bootstrap.routes]);
    React.useEffect(() => {
        if (runtime !== 'client')
            return;
        const enabledModules = bootstrap.enabledModules ?? [];
        const layoutKey = `${displayLocation.pathname}::${activeContexts.join(',')}`;
        if (layoutKey === lastLayoutKeyRef.current)
            return;
        lastLayoutKeyRef.current = layoutKey;
        const layoutTree = new LayoutTreeBuilder();
        const extensionsRegistry = new ExtensionsRegistry();
        const api = {
            registerComponents,
            registerProductTypeComponentStrategy,
            layout: layoutTree.at('page'),
            extend: extensionsRegistry
        };
        let cancelled = false;
        const run = async () => {
            await loadInterceptorsClient('default', api, enabledModules, { includeDefault: true });
            for (const ctx of activeContexts) {
                if (ctx !== 'default') {
                    await loadInterceptorsClient(ctx, api, enabledModules, { includeDefault: false });
                }
            }
            if (cancelled)
                return;
            const built = layoutTree.build();
            const nextRegions = buildRegions(built);
            const nextExtensions = extensionsRegistry.snapshotSorted();
            if (process.env.NODE_ENV !== 'production') {
                const registered = new Set(listRegisteredComponents());
                const issues = validateLayoutArtifacts({
                    regions: nextRegions,
                    extensions: nextExtensions,
                    isComponentRegistered: (name) => registered.has(name)
                });
                if (issues.length) {
                    console.warn('[Layout][validate] issues detected (client)', {
                        count: issues.length,
                        path: displayLocation.pathname,
                        first: issues.slice(0, 10)
                    });
                }
            }
            setRegions(nextRegions);
            setExtensions(nextExtensions);
        };
        run().catch((error) => console.error('[ClientLayout] Failed to rebuild layout', error));
        return () => {
            cancelled = true;
        };
    }, [activeContexts, bootstrap.enabledModules, displayLocation.pathname, runtime]);
    React.useEffect(() => {
        if (runtime !== 'client')
            return;
        let cancelled = false;
        const requestedLocation = location;
        const bootstrapConfig = (bootstrap?.config ?? {});
        const storeCodeForContext = (bootstrapConfig.storeCode ?? bootstrapConfig.store?.code ?? null);
        const targetPathname = typeof window !== 'undefined' ? window.location.pathname : location.pathname;
        const targetSearch = typeof window !== 'undefined' ? window.location.search : location.search;
        const targetUrl = `${targetPathname}${dedupeSearch(targetSearch)}`;
        const hasNonDefaultContext = Array.isArray(bootstrap?.contexts)
            ? bootstrap.contexts.some((c) => typeof c === 'string' && c !== 'default')
            : false;
        const hasBootstrapContext = Boolean(bootstrap.pageContext);
        const bootstrapExtensions = bootstrap.pageContext?.extensions;
        const bootstrapExtensionsCount = bootstrapExtensions && typeof bootstrapExtensions === 'object'
            ? Object.keys(bootstrapExtensions).length
            : 0;
        const shouldRevalidateOnMount = !hasBootstrapContext ||
            (hasNonDefaultContext &&
                (bootstrap.pageContext?.kind === 'default' || !bootstrapExtensionsCount));
        const isFirstEffect = !didMountRef.current;
        didMountRef.current = true;
        if (isFirstEffect && !shouldRevalidateOnMount) {
            return () => {
                cancelled = true;
            };
        }
        if (isFirstEffect && shouldRevalidateOnMount) {
            if (!hasBootstrapContext) {
                console.warn('[PageContext] Missing bootstrap.pageContext; revalidating via /api/page-context', {
                    url: targetUrl
                });
            }
            else if (hasNonDefaultContext) {
                console.warn('[PageContext] Suspicious bootstrap.pageContext for non-default route; revalidating via /api/page-context', {
                    url: targetUrl,
                    kind: bootstrap.pageContext?.kind,
                    extensionsCount: bootstrapExtensionsCount,
                    contexts: bootstrap?.contexts
                });
            }
        }
        const matchForRequestedLocation = (() => {
            const allRoutes = [
                { path: '/', component: 'HomePage', contexts: [] },
                { path: '/about', component: 'AboutPage', contexts: [] },
                ...(bootstrap.routes ?? [])
            ];
            const matches = matchRoutes(allRoutes.map((r) => ({ path: r.path })), requestedLocation);
            const last = matches?.length ? matches[matches.length - 1] : undefined;
            const activePath = (last?.route?.path ?? null);
            const entry = allRoutes.find((r) => r.path === activePath) ?? null;
            return { activePath, entry };
        })();
        const isListingQueryOnlyNavigation = !isFirstEffect &&
            matchForRequestedLocation.activePath === '/*' &&
            requestedLocation.pathname === displayLocation.pathname &&
            isListingQueryOnlyChange(displayLocation.search ?? '', requestedLocation.search ?? '');
        const shouldDelayRender = matchForRequestedLocation.activePath === '/*' && !isListingQueryOnlyNavigation;
        if (!isFirstEffect && !shouldDelayRender) {
            setDisplayLocation(requestedLocation);
        }
        if (!isFirstEffect && matchForRequestedLocation.entry?.path && matchForRequestedLocation.entry.path !== '/*') {
            // For non-Magento routes (e.g. /wishlist), we already know contexts/meta from the registry; apply immediately.
            setActiveContexts((matchForRequestedLocation.entry.contexts ?? []).slice());
            setActiveRouteMeta(matchForRequestedLocation.entry.meta);
        }
        const shouldFetchPayload = !isListingQueryOnlyNavigation &&
            shouldFetchPageContextPayload({
                isFirstEffect,
                shouldRevalidateOnMount,
                activePath: matchForRequestedLocation.activePath
            });
        if (!shouldFetchPayload) {
            if (isListingQueryOnlyNavigation) {
                return () => {
                    cancelled = true;
                };
            }
            // Avoid /api/page-context for static routes (no catch-all resolver).
            // Also reset PageContext.kind/extensions to avoid leaking previous dynamic context into static pages.
            const kind = typeof matchForRequestedLocation.entry?.meta?.type === 'string'
                ? String(matchForRequestedLocation.entry.meta.type)
                : 'default';
            setPageContext({
                kind,
                store: { code: storeCodeForContext },
                extensions: {}
            });
            return () => {
                cancelled = true;
            };
        }
        const run = async () => {
            try {
                const clientInstance = getClientInstanceId();
                navSeqRef.current += 1;
                const reason = isFirstEffect ? 'mount-revalidate' : 'navigation';
                const json = await getPageContextPayload(targetUrl, {
                    reason,
                    navSeq: navSeqRef.current,
                    clientInstance
                });
                if (!json)
                    return;
                const currentUrl = typeof window !== 'undefined'
                    ? `${window.location.pathname}${dedupeSearch(window.location.search)}`
                    : targetUrl;
                const stillCurrent = typeof window === 'undefined' || currentUrl === targetUrl;
                if (cancelled || !stillCurrent)
                    return;
                if (json?.routeMeta && isRedirectRouteMeta(json.routeMeta)) {
                    const to = json.routeMeta.redirectTo;
                    if (to && to !== location.pathname) {
                        navigate(to, { replace: true });
                        return;
                    }
                }
                if (json?.pageContext) {
                    setPageContext(json.pageContext);
                }
                if (Array.isArray(json?.contexts)) {
                    setActiveContexts(json.contexts.filter((c) => typeof c === 'string'));
                }
                if (json?.routeMeta && typeof json.routeMeta === 'object') {
                    setActiveRouteMeta(normalizeRouteMeta(json.routeMeta));
                }
                else {
                    setActiveRouteMeta(undefined);
                }
                // Commit the new URL to the rendered tree only after we have its payload (prevents category/category flicker).
                setDisplayLocation(requestedLocation);
            }
            catch {
                // silent: page context refresh is optional
            }
        };
        void run().catch(() => { });
        return () => {
            cancelled = true;
        };
    }, [bootstrap, location.pathname, location.search, navigate, runtime]);
    const routes = React.useMemo(() => [
        { path: '/', component: 'HomePage' },
        { path: '/about', component: 'AboutPage' },
        ...(bootstrap.routes ?? []).map((r) => ({
            ...r,
            meta: r?.meta ? normalizeRouteMeta(r.meta) : undefined
        }))
    ], [bootstrap.routes]);
    const activeRoutePath = React.useMemo(() => {
        const matches = matchRoutes(routes.map((r) => ({ path: r.path })), displayLocation);
        const last = matches?.length ? matches[matches.length - 1] : undefined;
        return (last?.route?.path ?? null);
    }, [displayLocation, routes]);
    const config = (bootstrap?.config ?? {});
    const storeCode = config.storeCode ?? config.store?.code;
    const storeConfig = config.store ?? null;
    const i18n = config.i18n ?? {};
    return (_jsx(I18nProvider, { lang: i18n.lang, messages: i18n.messages, children: _jsx(AppEnvironmentProvider, { runtime: runtime, storeCode: storeCode, store: storeConfig, children: _jsx(PageContextProvider, { value: pageContext, children: _jsx("div", { children: _jsx(RenderedLocationProvider, { location: displayLocation, children: _jsx(Routes, { location: displayLocation, children: routes.map((route) => {
                                const Comp = resolveComponent(route);
                                const isActive = route.path === activeRoutePath;
                                const resolvedMeta = isActive ? (activeRouteMeta ?? route.meta) : route.meta;
                                const layout = resolvedMeta?.layout ?? route.layout ?? '@renia/framework/layout/layouts/Layout1Column';
                                return (_jsx(Route, { path: route.path, element: _jsx(LayoutShell, { layout: layout, main: _jsx(Comp, { meta: resolvedMeta }), resolveComponent: resolveComponent, regions: regions, extensions: extensions, routeMeta: resolvedMeta }) }, route.path));
                            }) }) }) }) }) }) }));
};
export default AppRoot;

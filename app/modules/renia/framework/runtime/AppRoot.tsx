// @env: mixed
import React from 'react';
import { Route, Routes, matchRoutes, useLocation, useNavigate } from 'react-router-dom';
import type { RouteDefinition } from '@renia/framework/router/types';
import { registerComponents, resolveComponentEntry } from '../registry/componentRegistry';
import { AppEnvironmentProvider, type AppRuntime } from './AppEnvContext';
import { PageContextProvider, type PageContext } from './PageContext';
import {
  LayoutShell,
  LayoutTreeBuilder,
  buildRegions,
  ExtensionsRegistry,
  validateLayoutArtifacts,
  type RegionsSnapshot,
  type ExtensionsSnapshot
} from '@renia/framework/layout';
import { I18nProvider } from 'renia-i18n/context/I18nProvider';
import { loadInterceptorsClient } from '@renia/framework/interceptors/loadInterceptorsClient';
import { registerProductTypeComponentStrategy } from '@renia/framework/runtime/productTypeStrategies';
import { listRegisteredComponents } from '@renia/framework/registry/componentRegistry';
import { isRedirectRouteMeta, normalizeRouteMeta, type RouteMeta } from '@renia/framework/router/routeMeta';
import { dedupeSearch } from '@renia/framework/router/paths';
import { getClientInstanceId, getPageContextPayload } from './pageContextClient';
import { shouldFetchPageContextPayload } from './pageContextPolicy';
import { RenderedLocationProvider } from '@renia/framework/router/renderedLocation';

const LISTING_QUERY_KEYS = new Set(['page', 'p', 'pageSize', 'page_size', 'limit', 'ps', 'sort', 's']);

const normalizeNonListingSearch = (search: string | null | undefined): string => {
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

const isListingQueryOnlyChange = (prevSearch: string, nextSearch: string): boolean =>
  normalizeNonListingSearch(prevSearch) === normalizeNonListingSearch(nextSearch);

const HomePage: React.FC = () => (
  <section className="card">
    <h1 style={{ margin: '0 0 0.5rem' }}>React SSR starter</h1>
    <p style={{ margin: 0 }}>Ten widok jest budowany w oparciu o dynamiczne trasy i sloty z modułów.</p>
  </section>
);

type RouteEntry = {
  path: string;
  component?: string;
  componentPath?: string;
  layout?: string;
  contexts?: string[];
  meta?: RouteMeta;
};

type BootstrapData = {
  routes: RouteEntry[];
  regions: RegionsSnapshot;
  extensions?: ExtensionsSnapshot;
  pageContext?: PageContext;
  contexts?: string[];
  enabledModules?: string[];
  config?: Record<string, unknown> & {
    i18n?: {
      lang?: string;
      messages?: Record<string, string>;
    };
  };
};

const AboutPage: React.FC = () => (
  <section className="card">
    <h1 style={{ margin: '0 0 0.5rem' }}>O projekcie</h1>
    <p style={{ margin: 0 }}>Dodaj swoje widoki, logikę routingu i integracje API według potrzeb.</p>
  </section>
);

const MissingComponent: React.FC = () => null;

registerComponents({
  HomePage,
  AboutPage
});

type AppRootProps = {
  bootstrap: BootstrapData;
  runtime?: AppRuntime;
};

export const AppRoot: React.FC<AppRootProps> = ({ bootstrap, runtime = 'client' }) => {
  const resolveComponent = (entry: { component?: string; componentPath?: string }): React.ComponentType<any> =>
    resolveComponentEntry(entry, MissingComponent);

  const location = useLocation();
  const navigate = useNavigate();
  const [displayLocation, setDisplayLocation] = React.useState(location);
  const [pageContext, setPageContext] = React.useState<PageContext | undefined>(bootstrap.pageContext);
  const [regions, setRegions] = React.useState<RegionsSnapshot>(bootstrap.regions ?? {});
  const [extensions, setExtensions] = React.useState<ExtensionsSnapshot>(bootstrap.extensions ?? {});
  const [activeContexts, setActiveContexts] = React.useState<string[]>((bootstrap.contexts ?? []).slice());
  const [activeRouteMeta, setActiveRouteMeta] = React.useState<RouteMeta | undefined>(() => {
    const routes: RouteEntry[] = [
      { path: '/', component: 'HomePage', contexts: [] },
      { path: '/about', component: 'AboutPage', contexts: [] },
      ...(bootstrap.routes ?? [])
    ];
    const matches = matchRoutes(routes.map((r) => ({ path: r.path })) as any, location);
    const last = matches?.length ? matches[matches.length - 1] : undefined;
    const activePath = (last?.route as any)?.path as string | undefined;
    const entry = routes.find((r) => r.path === activePath);
    return entry?.meta ? normalizeRouteMeta(entry.meta) : undefined;
  });
  const lastLayoutKeyRef = React.useRef<string>('');
  const navSeqRef = React.useRef(0);
  const didMountRef = React.useRef(false);

  React.useEffect(() => {
    setPageContext(bootstrap.pageContext);
    setRegions((bootstrap.regions ?? {}) as any);
    setExtensions((bootstrap.extensions ?? {}) as any);
    setActiveContexts((bootstrap.contexts ?? []).slice());
    const routes: RouteEntry[] = [
      { path: '/', component: 'HomePage', contexts: [] },
      { path: '/about', component: 'AboutPage', contexts: [] },
      ...(bootstrap.routes ?? [])
    ];
    const matches = matchRoutes(routes.map((r) => ({ path: r.path })) as any, location);
    const last = matches?.length ? matches[matches.length - 1] : undefined;
    const activePath = (last?.route as any)?.path as string | undefined;
    const entry = routes.find((r) => r.path === activePath);
    setActiveRouteMeta(entry?.meta ? normalizeRouteMeta(entry.meta) : undefined);
    setDisplayLocation(location);
  }, [bootstrap.pageContext, bootstrap.regions, bootstrap.extensions, bootstrap.contexts, bootstrap.routes]);

  React.useEffect(() => {
    if (runtime !== 'client') return;

    const enabledModules = bootstrap.enabledModules ?? [];

    const layoutKey = `${displayLocation.pathname}::${activeContexts.join(',')}`;
    if (layoutKey === lastLayoutKeyRef.current) return;
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

      if (cancelled) return;
      const built = layoutTree.build();
      const nextRegions = buildRegions(built) as any;
      const nextExtensions = extensionsRegistry.snapshotSorted() as any;

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
	    if (runtime !== 'client') return;

	    let cancelled = false;
	    const requestedLocation = location;

	    const bootstrapConfig = ((bootstrap as any)?.config ?? {}) as any;
	    const storeCodeForContext = (bootstrapConfig.storeCode ?? bootstrapConfig.store?.code ?? null) as string | null;

	    const targetPathname = typeof window !== 'undefined' ? window.location.pathname : location.pathname;
	    const targetSearch = typeof window !== 'undefined' ? window.location.search : location.search;
	    const targetUrl = `${targetPathname}${dedupeSearch(targetSearch)}`;

    const hasNonDefaultContext = Array.isArray((bootstrap as any)?.contexts)
      ? (bootstrap as any).contexts.some((c: unknown) => typeof c === 'string' && c !== 'default')
      : false;

    const hasBootstrapContext = Boolean(bootstrap.pageContext);
    const bootstrapExtensions = (bootstrap.pageContext as any)?.extensions;
    const bootstrapExtensionsCount =
      bootstrapExtensions && typeof bootstrapExtensions === 'object'
        ? Object.keys(bootstrapExtensions).length
        : 0;

    const shouldRevalidateOnMount =
      !hasBootstrapContext ||
      (hasNonDefaultContext &&
        ((bootstrap.pageContext as any)?.kind === 'default' || !bootstrapExtensionsCount));

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
      } else if (hasNonDefaultContext) {
        console.warn('[PageContext] Suspicious bootstrap.pageContext for non-default route; revalidating via /api/page-context', {
          url: targetUrl,
          kind: (bootstrap.pageContext as any)?.kind,
          extensionsCount: bootstrapExtensionsCount,
          contexts: (bootstrap as any)?.contexts
        });
      }
    }

    const matchForRequestedLocation = (() => {
      const allRoutes: RouteEntry[] = [
        { path: '/', component: 'HomePage', contexts: [] },
        { path: '/about', component: 'AboutPage', contexts: [] },
        ...(bootstrap.routes ?? [])
      ];
      const matches = matchRoutes(allRoutes.map((r) => ({ path: r.path })) as any, requestedLocation);
      const last = matches?.length ? matches[matches.length - 1] : undefined;
      const activePath = ((last?.route as any)?.path ?? null) as string | null;
      const entry = allRoutes.find((r) => r.path === activePath) ?? null;
      return { activePath, entry };
    })();

	    const isListingQueryOnlyNavigation =
	      !isFirstEffect &&
	      matchForRequestedLocation.activePath === '/*' &&
	      requestedLocation.pathname === displayLocation.pathname &&
	      isListingQueryOnlyChange(displayLocation.search ?? '', requestedLocation.search ?? '');

	    const shouldDelayRender =
	      matchForRequestedLocation.activePath === '/*' && !isListingQueryOnlyNavigation;

	    if (!isFirstEffect && !shouldDelayRender) {
	      setDisplayLocation(requestedLocation);
	    }

	    if (!isFirstEffect && matchForRequestedLocation.entry?.path && matchForRequestedLocation.entry.path !== '/*') {
	      // For non-Magento routes (e.g. /wishlist), we already know contexts/meta from the registry; apply immediately.
	      setActiveContexts((matchForRequestedLocation.entry.contexts ?? []).slice());
	      setActiveRouteMeta(matchForRequestedLocation.entry.meta);
	    }

	    const shouldFetchPayload =
	      !isListingQueryOnlyNavigation &&
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
	      const kind =
	        typeof (matchForRequestedLocation.entry as any)?.meta?.type === 'string'
	          ? String((matchForRequestedLocation.entry as any).meta.type)
	          : 'default';
	      setPageContext({
	        kind,
	        store: { code: storeCodeForContext },
	        extensions: {}
	      } as any);

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
        if (!json) return;

        const currentUrl =
          typeof window !== 'undefined'
            ? `${window.location.pathname}${dedupeSearch(window.location.search)}`
            : targetUrl;
        const stillCurrent = typeof window === 'undefined' || currentUrl === targetUrl;
        if (cancelled || !stillCurrent) return;

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
        } else {
          setActiveRouteMeta(undefined);
        }

	        // Commit the new URL to the rendered tree only after we have its payload (prevents category/category flicker).
	        setDisplayLocation(requestedLocation);
	      } catch {
	        // silent: page context refresh is optional
      }
    };

    void run().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [bootstrap, location.pathname, location.search, navigate, runtime]);

  const routes = React.useMemo<RouteDefinition[]>(
    () => [
      { path: '/', component: 'HomePage' },
      { path: '/about', component: 'AboutPage' },
      ...(bootstrap.routes ?? []).map((r) => ({
        ...r,
        meta: r?.meta ? normalizeRouteMeta(r.meta) : undefined
      }))
    ],
    [bootstrap.routes]
  );

  const activeRoutePath = React.useMemo(() => {
    const matches = matchRoutes(routes.map((r) => ({ path: r.path })) as any, displayLocation);
    const last = matches?.length ? matches[matches.length - 1] : undefined;
    return ((last?.route as any)?.path ?? null) as string | null;
  }, [displayLocation, routes]);

  const config = (bootstrap?.config ?? {}) as any;
  const storeCode = config.storeCode ?? config.store?.code;
  const storeConfig = config.store ?? null;
  const i18n = config.i18n ?? {};

  return (
    <I18nProvider lang={i18n.lang} messages={i18n.messages}>
      <AppEnvironmentProvider runtime={runtime} storeCode={storeCode} store={storeConfig}>
        <PageContextProvider value={pageContext}>
          <div>
            <RenderedLocationProvider location={displayLocation}>
              <Routes location={displayLocation}>
                {routes.map((route) => {
                  const Comp = resolveComponent(route);
                  const isActive = route.path === activeRoutePath;
                  const resolvedMeta = isActive ? (activeRouteMeta ?? route.meta) : route.meta;
                  const layout = (resolvedMeta as any)?.layout ?? (route as any).layout ?? '@renia/framework/layout/layouts/Layout1Column';
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <LayoutShell
                          layout={layout}
                          main={<Comp meta={resolvedMeta} />}
                          resolveComponent={resolveComponent}
                          regions={regions}
                          extensions={extensions}
                          routeMeta={resolvedMeta}
                        />
                      }
                    />
                  );
                })}
              </Routes>
            </RenderedLocationProvider>
          </div>
        </PageContextProvider>
      </AppEnvironmentProvider>
    </I18nProvider>
  );
};

export default AppRoot;

// @env: mixed
import React from 'react';
import { Route, Routes, matchRoutes, useLocation } from 'react-router-dom';
import { registerComponents, resolveComponentEntry } from '../registry/componentRegistry';
import { AppEnvironmentProvider, type AppRuntime } from './AppEnvContext';
import { PageContextProvider, type PageContext } from './PageContext';
import type { StoreConfig } from 'renia-magento-store';
import { LayoutShell, LayoutTreeBuilder, flattenLayoutTree, type SlotEntry as LayoutSlotEntry } from '@framework/layout';
import { I18nProvider } from 'renia-i18n/context/I18nProvider';
import { loadInterceptorsClient } from '@framework/interceptors/loadInterceptorsClient';
import { registerProductTypeComponentStrategy } from 'renia-magento-product/services/productStrategies';

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
  meta?: Record<string, any>;
};

type SlotEntry = LayoutSlotEntry & {
  id?: string;
  enabled?: boolean;
};

type BootstrapData = {
  routes: RouteEntry[];
  slots: Record<string, SlotEntry[]>;
  subslots?: Record<string, any>;
  pageContext?: PageContext;
  enabledModules?: string[];
  config?: {
    magentoGraphQLEndpoint?: string;
    magentoStoreCode?: string;
    magentoRootCategoryId?: string;
    magentoProxyEndpoint?: string;
    preloadedCategoryMenu?: any;
    store?: StoreConfig;
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
  const [pageContext, setPageContext] = React.useState<PageContext | undefined>(bootstrap.pageContext);
  const [slots, setSlots] = React.useState<Record<string, SlotEntry[]>>(bootstrap.slots ?? {});
  const [subslots, setSubslots] = React.useState<Record<string, SlotEntry[]>>(bootstrap.subslots ?? {});
  const lastLayoutKeyRef = React.useRef<string>('');
  const didMountRef = React.useRef(false);
  const inflightRef = React.useRef<Map<string, Promise<void>>>(new Map());

  React.useEffect(() => {
    setPageContext(bootstrap.pageContext);
    setSlots((bootstrap.slots ?? {}) as any);
    setSubslots((bootstrap.subslots ?? {}) as any);
  }, [bootstrap.pageContext, bootstrap.slots, bootstrap.subslots]);

  React.useEffect(() => {
    if (runtime !== 'client') return;

    const allRoutes: RouteEntry[] = [
      { path: '/', component: 'HomePage', contexts: [] },
      { path: '/about', component: 'AboutPage', contexts: [] },
      ...(bootstrap.routes ?? [])
    ];

    const routeObjects = allRoutes.map((r) => ({
      path: r.path,
      handle: { contexts: r.contexts ?? [] }
    }));
    const matches = matchRoutes(routeObjects as any, location);
    const last = matches?.length ? matches[matches.length - 1] : undefined;
    const routeContexts = ((last?.route as any)?.handle?.contexts ?? []) as string[];
    const enabledModules = bootstrap.enabledModules ?? [];

    const layoutKey = `${location.pathname}::${routeContexts.join(',')}`;
    if (layoutKey === lastLayoutKeyRef.current) return;
    lastLayoutKeyRef.current = layoutKey;

    const layoutTree = new LayoutTreeBuilder();
    const api = {
      registerComponents,
      registerProductTypeComponentStrategy,
      layout: layoutTree.get('page')
    };

    let cancelled = false;
    const run = async () => {
      await loadInterceptorsClient('default', api, enabledModules, { includeDefault: true });
      for (const ctx of routeContexts) {
        if (ctx !== 'default') {
          await loadInterceptorsClient(ctx, api, enabledModules, { includeDefault: false });
        }
      }

      if (cancelled) return;
      const built = layoutTree.build();
      const flat = flattenLayoutTree(built);
      setSlots(flat.slots as any);
      setSubslots(flat.subslots as any);
    };

    run().catch((error) => console.error('[ClientLayout] Failed to rebuild layout', error));

    return () => {
      cancelled = true;
    };
  }, [bootstrap.routes, bootstrap.enabledModules, location.pathname, runtime]);

  React.useEffect(() => {
    if (runtime !== 'client') return;

    let cancelled = false;

    const targetUrl =
      typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : `${location.pathname}${location.search}`;

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

    if (inflightRef.current.has(targetUrl)) {
      return () => {
        cancelled = true;
      };
    }

    const run = async () => {
      try {
        const res = await fetch(`/api/page-context?url=${encodeURIComponent(targetUrl)}`, {
          method: 'GET',
          headers: { 'content-type': 'application/json' }
        });
        if (!res.ok) return;
        const json = (await res.json()) as { pageContext?: PageContext };
        if (!cancelled && json?.pageContext) {
          setPageContext(json.pageContext);
        }
      } catch {
        // silent: page context refresh is optional
      }
    };

    const task = run()
      .catch(() => {})
      .finally(() => {
        inflightRef.current.delete(targetUrl);
      });

    inflightRef.current.set(targetUrl, task);

    return () => {
      cancelled = true;
    };
  }, [bootstrap, location.pathname, location.search, runtime]);

  const routes = [
    { path: '/', component: 'HomePage' },
    { path: '/about', component: 'AboutPage' },
    ...bootstrap.routes
  ];

  const storeCode = (bootstrap?.config as any)?.magentoStoreCode ?? bootstrap?.config?.store?.code;
  const storeConfig = bootstrap?.config?.store;
  const i18n = bootstrap?.config?.i18n ?? {};

  return (
    <I18nProvider lang={i18n.lang} messages={i18n.messages}>
      <AppEnvironmentProvider runtime={runtime} storeCode={storeCode} store={storeConfig}>
        <PageContextProvider value={pageContext}>
          <div>
            <Routes>
              {routes.map((route) => {
                const Comp = resolveComponent(route);
                const layout = (route.meta as any)?.layout ?? (route as any).layout ?? '@framework/layout/layouts/Layout1Column';
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <LayoutShell
                        layout={layout}
                        main={<Comp meta={route.meta} />}
                        resolveComponent={resolveComponent}
                        slots={slots}
                        subslots={subslots}
                        routeMeta={route.meta}
                      />
                    }
                  />
                );
              })}
            </Routes>
          </div>
        </PageContextProvider>
      </AppEnvironmentProvider>
    </I18nProvider>
  );
};

export default AppRoot;

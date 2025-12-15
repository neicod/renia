// @env: server
// Główne entry serwera SSR: Express + render AppRoot z tras/layoutów/interceptorów.
// Musi pozostać tu jako punkt startu; nie przenoś/nie usuwaj, inaczej SSR/serwowanie statyków przestanie działać.
import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { loadRoutesRegistry } from '@framework/router';
import { matchPath } from 'react-router-dom';
import { loadInterceptors } from 'renia-interceptors';
import { loadLayoutRegistry } from 'renia-layout';
import AppRoot from '@framework/runtime/AppRoot';
import { htmlTemplate } from './template';
import {
  isGlobalSlot,
  extensionToSlotEntry,
  extensionToSubslotEntry,
  type ExtensionPoint
} from '@framework/layout/extensionPoints';
import type { MenuItem } from 'renia-menu';
import { loadComponentRegistrations } from '@framework/registry/loadModuleComponents';
import { getStoreConfig } from 'renia-magento-store';
import { loadMessages as loadI18nMessages } from 'renia-i18n/services/loader';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const staticDir = path.resolve(process.cwd(), 'dist/public');
const clientEntry = path.resolve(process.cwd(), 'src/client/index.tsx');
const clientOutFile = path.join(staticDir, 'index.js');
const assetVersionFile = path.join(staticDir, '.asset-version');

let clientBundleReady = false;
const ensureClientBundle = async () => {
  if (clientBundleReady) return;
  if (fs.existsSync(clientOutFile)) {
    clientBundleReady = true;
    return;
  }
  if (process.env.NODE_ENV === 'production') return;

  try {
    await fs.promises.mkdir(staticDir, { recursive: true });
    const esbuild = await import('esbuild');
    await esbuild.build({
      entryPoints: [clientEntry],
      bundle: true,
      sourcemap: true,
      format: 'esm',
      outfile: clientOutFile,
      loader: { '.tsx': 'tsx', '.ts': 'ts' },
      plugins: []
    });
    clientBundleReady = true;
  } catch (err) {
    console.error('Nie udało się zbudować paczki klienta (auto):', err);
  }
};

await ensureClientBundle();

app.use('/static', express.static(staticDir, { index: false }));
app.use(express.json({ limit: '1mb' }));

let cachedAssetVersion: { value: string | null; mtimeMs: number } | null = null;

const readAssetVersion = () => {
  try {
    const stats = fs.statSync(assetVersionFile);
    const version =
      cachedAssetVersion && cachedAssetVersion.mtimeMs === stats.mtimeMs
        ? cachedAssetVersion.value
        : fs.readFileSync(assetVersionFile, 'utf8').trim() || null;
    cachedAssetVersion = { value: version, mtimeMs: stats.mtimeMs };
    return version;
  } catch {
    cachedAssetVersion = null;
    return null;
  }
};

const resolveClientAssetPath = () => {
  const version = readAssetVersion();
  if (version) {
    return `/static/index.js?v=${encodeURIComponent(version)}`;
  }
  if (process.env.NODE_ENV !== 'production') {
    return `/static/index.js?v=${Date.now()}`;
  }
  return '/static/index.js';
};

const sortByPriority = <T extends { priority?: number }>(entries: T[]) =>
  entries.slice().sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

const contextFromPath = (pathname: string): string => {
  const trimmed = pathname.replace(/^\/+/, '').split('/')[0];
  return trimmed || 'default';
};

type SlotEntry = {
  slot: string;
  id?: string;
  component?: string;
  componentPath?: string;
  priority?: number;
  enabled?: boolean;
  props?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

type SubslotEntry = {
  slot: string;
  id?: string;
  component?: string;
  componentPath?: string;
  priority?: number;
  enabled?: boolean;
  props?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

const mergeSlots = (entries: SlotEntry[]): SlotEntry[] => {
  const map = new Map<string, SlotEntry>();

  for (const entry of entries) {
    if (!entry.slot || (!entry.component && !entry.componentPath)) continue;
    const key =
      entry.id ??
      `${entry.componentPath ?? entry.component ?? 'component'}::${entry.slot}`;

    const current: SlotEntry = map.get(key) ?? { slot: entry.slot };
    const merged: SlotEntry = {
      ...current,
      ...entry,
      enabled: entry.enabled ?? entry.enabled === false ? entry.enabled : current.enabled ?? true
    };

    map.set(key, merged);
  }

  return sortByPriority(
    Array.from(map.values()).filter((e) => e.enabled !== false)
  );
};

app.post('/api/magento/graphql', async (req, res) => {
  const upstream = process.env.MAGENTO_GRAPHQL_ENDPOINT;
  if (!upstream) {
    return res.status(500).json({ error: 'Brak MAGENTO_GRAPHQL_ENDPOINT' });
  }

  try {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...(req.headers['authorization'] ? { authorization: String(req.headers['authorization']) } : {})
    };

    if (process.env.MAGENTO_STORE_CODE) {
      headers['store'] = process.env.MAGENTO_STORE_CODE;
    }
    if (process.env.MAGENTO_HOST_HEADER) {
      headers['host'] = process.env.MAGENTO_HOST_HEADER;
    }

    const upstreamResp = await fetch(upstream, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body ?? {})
    });

    const text = await upstreamResp.text();
    res
      .status(upstreamResp.status)
      .set('content-type', upstreamResp.headers.get('content-type') ?? 'application/json')
      .send(text);
  } catch (error) {
    console.error('Błąd proxy GraphQL:', error);
    res.status(502).json({ error: 'Proxy GraphQL nieosiągalne', details: String(error) });
  }
});

app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(staticDir, 'favicon.ico');
  if (fs.existsSync(faviconPath)) {
    return res.sendFile(faviconPath);
  }
  res.status(204).end();
});

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

app.get('*', async (req, res) => {
  try {
    const configPath = path.resolve(process.cwd(), 'app/etc/config.json');
    await loadComponentRegistrations({ configPath });
    const routes = await loadRoutesRegistry({ configPath });
    const layoutRegistry = await loadLayoutRegistry({ configPath });

    let preloadedCategoryMenu: MenuItem[] | undefined;

    const appConfig: {
      magentoGraphQLEndpoint?: string;
      magentoRootCategoryId?: string;
      magentoProxyEndpoint?: string;
      magentoStoreCode?: string;
      preloadedCategoryMenu?: MenuItem[];
      store?: Awaited<ReturnType<typeof getStoreConfig>>;
    } = {
      magentoGraphQLEndpoint: process.env.MAGENTO_GRAPHQL_ENDPOINT,
      magentoRootCategoryId: process.env.MAGENTO_ROOT_CATEGORY_ID,
      magentoProxyEndpoint: process.env.MAGENTO_PROXY_ENDPOINT ?? '/api/magento/graphql',
      magentoStoreCode: process.env.MAGENTO_STORE_CODE,
      preloadedCategoryMenu
    };

    // Udostępniamy config również w kontekście SSR, aby komponenty mogły z niego korzystać.
    (globalThis as any).__APP_CONFIG__ = appConfig;

    if (process.env.MAGENTO_GRAPHQL_ENDPOINT) {
      try {
        const { fetchMenu } = await import('renia-magento-category/services/menu');
        const rootCategoryId = process.env.MAGENTO_ROOT_CATEGORY_ID;
        const variables = rootCategoryId
          ? { filters: { parent_id: { eq: rootCategoryId } } }
          : undefined;

        preloadedCategoryMenu = await fetchMenu({
          variables,
          headers: process.env.MAGENTO_HOST_HEADER ? { host: process.env.MAGENTO_HOST_HEADER } : undefined
        });
        appConfig.preloadedCategoryMenu = preloadedCategoryMenu;
      } catch (err) {
        console.error('Nie udało się wstępnie pobrać menu kategorii:', err);
      }
    }

    if (!appConfig.store) {
      try {
        const storeConfig = await getStoreConfig();
        appConfig.store = storeConfig;
        if (!appConfig.magentoStoreCode && storeConfig.code) {
          appConfig.magentoStoreCode = storeConfig.code;
        }
      } catch (err) {
        console.error('Nie udało się pobrać konfiguracji sklepu:', err);
      }
    }

    const slotEntries: SlotEntry[] = [];
    const subslotEntries: SubslotEntry[] = [];
    const api = {
      extension: (name: string, config: Omit<ExtensionPoint, 'name'> = {}) => {
        const ext: ExtensionPoint = { name, ...config };

        // Automatically determine if this is a global slot or nested subslot
        if (isGlobalSlot(name)) {
          // Global slots (header, footer, content, etc.)
          const slotEntry = extensionToSlotEntry(ext);
          if (slotEntry?.slot && (slotEntry?.component || slotEntry?.componentPath)) {
            slotEntries.push(slotEntry);
          }
        } else {
          // Nested subslots (product-listing-actions, etc.)
          const subslotEntry = extensionToSubslotEntry(ext);
          if (subslotEntry?.slot && (subslotEntry?.component || subslotEntry?.componentPath)) {
            subslotEntries.push(subslotEntry);
          }
        }
      }
    };

  const context = contextFromPath(req.path);

    // global
    await loadInterceptors('default', { configPath }, api);
    // control-menu jako stały slot na każdej stronie
    await loadInterceptors('control-menu', { configPath }, api);
    // kontekst strony (unikamy drugiego wywołania default)
    if (context !== 'default') {
      await loadInterceptors(context, { configPath }, api);
    }

    const slots: Record<string, SlotEntry[]> = {};
    const subslots: Record<string, SubslotEntry[]> = {};
    const categoryPath =
      context === 'category'
        ? req.path.replace(/^\/+category\/?/, '').replace(/\/+$/, '')
        : undefined;

    for (const entry of slotEntries) {
      if (context === 'category' && entry.slot === 'content' && categoryPath) {
        entry.props = { ...(entry.props ?? {}), categoryUrlPath: categoryPath };
      }
      const list = slots[entry.slot] ?? [];
      list.push(entry);
      slots[entry.slot] = list;
    }
    Object.keys(slots).forEach((slot) => {
      slots[slot] = mergeSlots(slots[slot]);
    });

    for (const entry of subslotEntries) {
      const list = subslots[entry.slot] ?? [];
      list.push(entry);
      subslots[entry.slot] = list;
    }
    Object.keys(subslots).forEach((slot) => {
      subslots[slot] = mergeSlots(subslots[slot]);
    });

    const match = routes.find((r) => matchPath({ path: r.path, end: false }, req.path));
    const routeMeta = { ...(match?.meta ?? {}) };

    if (match?.handler) {
      try {
        const handlerModule = await import(match.handler);
        const handler = handlerModule.default ?? handlerModule;
        if (typeof handler === 'function') {
          const handlerResult =
            (await handler({ req, route: match, params: matchPath({ path: match.path, end: false }, req.path)?.params ?? {} })) ||
            {};
          if (handlerResult.meta && typeof handlerResult.meta === 'object') {
            Object.assign(routeMeta, handlerResult.meta);
          }
        }
      } catch (err) {
        console.error(`Nie udało się uruchomić handlera dla trasy ${match?.path}:`, err);
      }
    }

    if (routeMeta?.categoryProductListing) {
      Object.values(slots).forEach((entries) => {
        entries.forEach((entry) => {
          if (
            entry.componentPath === 'renia-magento-catalog/components/CategoryProductList' ||
            entry.component === 'renia-magento-catalog/components/CategoryProductList'
          ) {
            entry.props = {
              ...(entry.props ?? {}),
              initialListing: routeMeta.categoryProductListing
            };
          }
        });
      });
    }
    if (routeMeta?.searchProductListing) {
      Object.values(slots).forEach((entries) => {
        entries.forEach((entry) => {
          if (
            entry.componentPath === 'renia-magento-catalog-search/components/SearchProductList' ||
            entry.component === 'renia-magento-catalog-search/components/SearchProductList'
          ) {
            entry.props = {
              ...(entry.props ?? {}),
              initialListing: routeMeta.searchProductListing
            };
          }
        });
      });
    }

    // I18n: wybierz język (storeConfig.locale) i dołącz scalone tłumaczenia z dist/i18n
    const lang = appConfig.store?.locale ?? 'en_US';
    const i18nMessages = loadI18nMessages(lang);

    const bootstrap = {
      routes: routes.map((r) => ({
        path: r.path,
        component: r.component,
        componentPath: r.componentPath,
        layout: (r.meta as any)?.layout ?? '1column',
        meta: r.path === match?.path ? routeMeta : r.meta ?? {}
      })),
      slots,
      subslots,
      layouts: layoutRegistry.layouts,
      layoutSlots: layoutRegistry.slots,
      config: {
        ...appConfig,
        i18n: {
          lang,
          messages: i18nMessages
        }
      }
    };

    // Podaj initial translations do I18nBootstrap jeśli slot istnieje
    const overlay = bootstrap.slots?.['global-overlay'];
    if (overlay) {
      overlay.forEach((entry: any) => {
        if (
          entry.componentPath === 'renia-i18n/components/I18nBootstrap' ||
          entry.component === 'renia-i18n/components/I18nBootstrap'
        ) {
          entry.props = {
            ...(entry.props ?? {}),
            initialLang: lang,
            initialMessages: i18nMessages
          };
        }
      });
    }

    const appHtml = renderToString(
      <StaticRouter location={req.url}>
        <AppRoot bootstrap={bootstrap} runtime="ssr" />
      </StaticRouter>
    );

    const html = htmlTemplate({
      appHtml,
      title: 'React SSR starter',
      assetPath: resolveClientAssetPath(),
      bootstrap
    });

    res
      .status(200)
      .setHeader('Content-Type', 'text/html')
      .send(html);
  } catch (error) {
    console.error('Błąd renderowania SSR:', error);
    res.status(500).send('Wewnętrzny błąd serwera');
  }
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  // intentionally silent in dev to reduce log noise
});

// Główne entry serwera SSR: Express + render AppRoot z tras/layoutów/interceptorów.
// Musi pozostać tu jako punkt startu; nie przenoś/nie usuwaj, inaczej SSR/serwowanie statyków przestanie działać.
import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { loadRoutesRegistry } from 'renia-router';
import { loadInterceptors } from 'renia-interceptors';
import { loadLayoutRegistry } from 'renia-layout';
import AppRoot from '../shared/AppRoot';
import { htmlTemplate } from './template';
import type { MenuItem } from 'renia-menu';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const staticDir = path.resolve(process.cwd(), 'dist/public');

app.use('/static', express.static(staticDir, { index: false }));
app.use(express.json({ limit: '1mb' }));

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
};

const mergeSlots = (entries: SlotEntry[]): SlotEntry[] => {
  const map = new Map<string, SlotEntry>();

  for (const entry of entries) {
    if (!entry.slot || (!entry.component && !entry.componentPath)) continue;
    const key =
      entry.id ??
      `${entry.componentPath ?? entry.component ?? 'component'}::${entry.slot}`;

    const current = map.get(key) ?? {};
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

app.get('*', async (req, res) => {
  try {
    const configPath = path.resolve(process.cwd(), 'app/etc/config.json');
    const routes = await loadRoutesRegistry({ configPath });
    const layoutRegistry = await loadLayoutRegistry({ configPath });

    let preloadedCategoryMenu: MenuItem[] | undefined;
    if (process.env.MAGENTO_GRAPHQL_ENDPOINT) {
      try {
        const { fetchMenu } = await import('renia-magento-category/services/menu');
        const rootCategoryId = process.env.MAGENTO_ROOT_CATEGORY_ID;
        const variables = rootCategoryId
          ? { filters: { parent_id: { eq: rootCategoryId } } }
          : undefined;

        preloadedCategoryMenu = await fetchMenu({
          endpoint: process.env.MAGENTO_GRAPHQL_ENDPOINT,
          storeCode: process.env.MAGENTO_STORE_CODE,
          variables,
          headers: process.env.MAGENTO_HOST_HEADER ? { host: process.env.MAGENTO_HOST_HEADER } : undefined
        });
      } catch (err) {
        console.warn('Nie udało się wstępnie pobrać menu kategorii:', err);
      }
    }

    const appConfig = {
      magentoGraphQLEndpoint: process.env.MAGENTO_GRAPHQL_ENDPOINT,
      magentoStoreCode: process.env.MAGENTO_STORE_CODE,
      magentoRootCategoryId: process.env.MAGENTO_ROOT_CATEGORY_ID,
      magentoProxyEndpoint: process.env.MAGENTO_PROXY_ENDPOINT ?? '/api/magento/graphql',
      preloadedCategoryMenu
    };

    // Udostępniamy config również w kontekście SSR, aby komponenty mogły z niego korzystać.
    (globalThis as any).__APP_CONFIG__ = appConfig;

    const slotEntries: SlotEntry[] = [];
    const api = {
      slots: {
        add: (entry: SlotEntry) => {
          if (entry?.slot && (entry?.component || entry?.componentPath)) slotEntries.push(entry);
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
    for (const entry of slotEntries) {
      const list = slots[entry.slot] ?? [];
      list.push(entry);
      slots[entry.slot] = list;
    }
    Object.keys(slots).forEach((slot) => {
      slots[slot] = mergeSlots(slots[slot]);
    });

    const bootstrap = {
      routes: routes.map((r) => ({
        path: r.path,
        component: r.component,
        componentPath: r.componentPath,
        layout: (r.meta as any)?.layout ?? '1column'
      })),
      slots,
      layouts: layoutRegistry.layouts,
      layoutSlots: layoutRegistry.slots,
      config: appConfig
    };

    const appHtml = renderToString(
      <StaticRouter location={req.url}>
        <AppRoot bootstrap={bootstrap} />
      </StaticRouter>
    );

    const html = htmlTemplate({
      appHtml,
      title: 'React SSR starter',
      assetPath: '/static/index.js',
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
  console.log(`SSR server uruchomiony: http://localhost:${port}`);
});

// Główne entry serwera SSR: Express + render AppRoot z tras/layoutów/interceptorów.
// Musi pozostać tu jako punkt startu; nie przenoś/nie usuwaj, inaczej SSR/serwowanie statyków przestanie działać.
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const staticDir = path.resolve(process.cwd(), 'dist/public');

app.use('/static', express.static(staticDir, { index: false }));

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

app.get('*', async (req, res) => {
  try {
    const configPath = path.resolve(process.cwd(), 'app/etc/config.json');
    const routes = await loadRoutesRegistry({ configPath });
    const layoutRegistry = await loadLayoutRegistry({ configPath });

    const controlMenu: SlotEntry[] = [];
    const api = {
      slots: {
        add: (entry: SlotEntry) => {
          if (entry?.slot && (entry?.component || entry?.componentPath)) controlMenu.push(entry);
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

    const bootstrap = {
      routes: routes.map((r) => ({
        path: r.path,
        component: r.component,
        componentPath: r.componentPath,
        layout: (r.meta as any)?.layout ?? '1column'
      })),
      slots: {
        'control-menu': mergeSlots(controlMenu)
      },
      layouts: layoutRegistry.layouts,
      layoutSlots: layoutRegistry.slots
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

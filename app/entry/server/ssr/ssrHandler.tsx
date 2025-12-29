// @env: server
// SSR route handler extracted from app/entry/server/index.tsx (composition root).
import type { Application, Request, Response } from 'express';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

import AppRoot from '@renia/framework/runtime/AppRoot';
import { htmlTemplate } from '../template';
import { LayoutTreeBuilder, buildRegions, ExtensionsRegistry, validateLayoutArtifacts } from '@renia/framework/layout';
import { registerComponents, listRegisteredComponents } from '@renia/framework/registry/componentRegistry';
import { registerProductTypeComponentStrategy } from '@renia/framework/runtime/productTypeStrategies';
import { loadMessages as loadI18nMessages } from 'renia-i18n/services/loader';
import type { PageContext } from '@renia/framework/runtime/PageContext';
import { applyPageContextAugmenters } from '@renia/framework/runtime/pageContextAugmenters';
import { isRedirectRouteMeta, normalizeRouteMeta } from '@renia/framework/router/routeMeta';
import { matchBestRoute } from '@renia/framework/router/match';
import { loadInterceptors } from '@renia/framework/interceptors/loadInterceptors';

import crypto from 'node:crypto';
import { buildAppConfig, resolvePrefix, runWithRequestContext, withOverriddenPath } from '@renia/framework/server/hooks';
import { buildStatusMap, ensureFrameworkLayoutComponentsRegistered, loadRuntimeState } from '../runtime/runtimeState';

const isLayoutValidationEnabled = (): boolean => {
  const raw = process.env.RENIA_VALIDATE_LAYOUT;
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  return process.env.NODE_ENV !== 'production';
};

export type RegisterSsrRouteOptions = {
  resolveClientAssetPath: () => string;
};

export const registerSsrRoute = (app: Application, options: RegisterSsrRouteOptions) => {
  app.get('*', async (req: Request, res: Response) => {
    try {
      const ssrStartedAt = Date.now();
      const configPath = path.resolve(process.cwd(), 'app/etc/config.json');

      const prefix = resolvePrefix(req.path, req);

      const { enabledModules, routes } = await loadRuntimeState(configPath);
      ensureFrameworkLayoutComponentsRegistered();

      const reqUrl = new URL(req.originalUrl ?? req.url, 'http://local');
      const appConfig = await buildAppConfig({ purpose: 'ssr', req, prefix, url: reqUrl });

      const requestId =
        (typeof req.headers['x-request-id'] === 'string' && req.headers['x-request-id']) ||
        (typeof (crypto as any).randomUUID === 'function' ? (crypto as any).randomUUID() : String(Date.now()));

      await runWithRequestContext(
        { requestId, purpose: 'ssr', req, prefix, url: reqUrl, config: appConfig },
        async () => {
      const { entry: match, params: routeParams } = matchBestRoute(routes as any, prefix.routingPath);
      let routeContexts = (match?.contexts ?? []) as string[];

      let routeMeta = normalizeRouteMeta({ ...(match?.meta ?? {}), __ssrPath: prefix.routingPath });

      const statusMap = buildStatusMap(enabledModules);
      const layoutTree = new LayoutTreeBuilder();
      const extensions = new ExtensionsRegistry();

      const api = {
        registerComponents,
        registerProductTypeComponentStrategy,
        layout: layoutTree.at('page'),
        extend: extensions
      };

      await loadInterceptors('default', { configPath, statusMap, includeDefault: true }, api);

      if (match?.handler) {
        try {
          const handlerModule = await import(match.handler);
          const handler = handlerModule.default ?? handlerModule;
          if (typeof handler === 'function') {
            const reqForHandler = withOverriddenPath(req as any, prefix.routingPath);
            const handlerResult =
              (await handler({
                req: reqForHandler,
                route: match,
                params: routeParams ?? {},
                store: appConfig.store ?? null
              })) ||
              {};
            if (handlerResult.meta && typeof handlerResult.meta === 'object') {
              routeMeta = normalizeRouteMeta({ ...(routeMeta as any), ...(handlerResult.meta as any), __ssrPath: prefix.routingPath });
            }
            if (Array.isArray(handlerResult.contexts)) {
              routeContexts = handlerResult.contexts.filter((c: any) => typeof c === 'string');
            }
          }
        } catch (err) {
          console.error(`Nie udało się uruchomić handlera dla trasy ${match?.path}:`, err);
        }
      }

      if (isRedirectRouteMeta(routeMeta)) {
        const redirectCode = routeMeta.redirectCode || 302;
        const to = routeMeta.redirectTo || null;

        const basePath = typeof prefix.basePath === 'string' ? prefix.basePath : '';
        const withBasePath = (p: string) => {
          if (/^https?:\/\//i.test(p)) return p;
          const bp = basePath && basePath !== '/' ? `/${basePath.replace(/^\/+|\/+$/g, '')}` : '';
          const path = p.startsWith('/') ? p : `/${p}`;
          if (!bp) return path;
          if (path === '/') return `${bp}/`;
          return `${bp}${path}`;
        };

        if (to) {
          return res.redirect(redirectCode, withBasePath(to));
        }
      }

      for (const ctx of routeContexts) {
        if (ctx !== 'default') {
          await loadInterceptors(ctx, { configPath, statusMap, includeDefault: false }, api);
        }
      }

      const builtTree = layoutTree.build();
      const regions = buildRegions(builtTree);
      const extensionsSnapshot = extensions.snapshotSorted();

      if (isLayoutValidationEnabled()) {
        const registered = new Set(listRegisteredComponents());
        const issues = validateLayoutArtifacts({
          regions,
          extensions: extensionsSnapshot,
          isComponentRegistered: (name) => registered.has(name)
        });
        if (issues.length) {
          console.warn('[Layout][validate] issues detected', {
            count: issues.length,
            url: req.originalUrl ?? req.url,
            routingPath: prefix.routingPath,
            first: issues.slice(0, 10)
          });
        }
      }

      const pageContext: PageContext = applyPageContextAugmenters(
        {
          kind: typeof (routeMeta as any)?.type === 'string' ? ((routeMeta as any).type as string) : 'default',
          store: {
            code: (appConfig as any)?.storeCode ?? ((appConfig as any)?.store as any)?.code ?? null
          },
          extensions: {}
        },
        {
          req: { path: req.path, url: req.url },
          routeMeta,
          routeContexts
        }
      );

      const lang = (prefix.locale ?? (appConfig as any)?.locale ?? ((appConfig as any)?.store as any)?.locale ?? 'en_US') as string;
      const i18nMessages = loadI18nMessages(lang);

      const bootstrap = {
        basePath: prefix.basePath,
        routes: routes.map((r) => ({
          path: r.path,
          component: r.component,
          componentPath: r.componentPath,
          contexts: (r as any).contexts ?? [],
          layout: (r.meta as any)?.layout ?? '@renia/framework/layout/layouts/Layout1Column',
          meta: r.path === match?.path ? routeMeta : r.meta ?? {}
        })),
        regions,
        extensions: extensionsSnapshot,
        contexts: routeContexts,
        enabledModules,
        pageContext,
        config: {
          ...appConfig,
          i18n: {
            lang,
            messages: i18nMessages
          }
        }
      };

      const overlay = bootstrap.regions?.['global-overlay'];
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
        <StaticRouter location={req.url} basename={prefix.basePath || undefined}>
          <AppRoot bootstrap={bootstrap} runtime="ssr" />
        </StaticRouter>
      );

      const html = htmlTemplate({
        appHtml,
        title: 'React SSR starter',
        assetPath: options.resolveClientAssetPath(),
        bootstrap
      });

      const statusCode = (routeMeta as any)?.type === 'not-found' ? 404 : 200;

      res
        .status(statusCode)
        .setHeader('Content-Type', 'text/html')
        .send(html);
        }
      );
    } catch (error) {
      console.error('Błąd renderowania SSR:', error);
      res.status(500).send('Wewnętrzny błąd serwera');
    }
  });
};

export default {
  registerSsrRoute
};

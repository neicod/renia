// @env: server
import type { Application, Request, Response } from 'express';
import path from 'node:path';
import { loadInterceptors } from '@renia/framework/interceptors/loadInterceptors';
import { ExtensionsRegistry } from '@renia/framework/layout';
import { registerComponents } from '@renia/framework/registry/componentRegistry';
import { registerProductTypeComponentStrategy } from '@renia/framework/runtime/productTypeStrategies';
import type { PageContext } from '@renia/framework/runtime/PageContext';
import { applyPageContextAugmenters } from '@renia/framework/runtime/pageContextAugmenters';
import { isRedirectRouteMeta, normalizeRouteMeta } from '@renia/framework/router/routeMeta';
import { matchBestRoute } from '@renia/framework/router/match';
import crypto from 'node:crypto';
import { buildAppConfig, resolvePrefix, runWithRequestContext } from '@renia/framework/server/hooks';
import { buildStatusMap, loadRuntimeState } from '../runtime/runtimeState';

export const registerPageContextRoute = (app: Application) => {
  app.get('/api/page-context', async (req: Request, res: Response) => {
    try {
      const startedAt = Date.now();
      const configPath = path.resolve(process.cwd(), 'app/etc/config.json');

      const { enabledModules, routes } = await loadRuntimeState(configPath);

      const rawUrl = typeof (req.query as any)?.url === 'string' ? String((req.query as any).url) : '';
      if (!rawUrl) {
        return res.status(400).json({ error: 'Missing url query parameter' });
      }

      const urlObj = new URL(rawUrl, 'http://local');
      const prefix = resolvePrefix(urlObj.pathname, req);
      const routingUrl = `${prefix.routingPath}${urlObj.search ?? ''}`;

      const { entry: match, params: routeParams } = matchBestRoute(routes as any, prefix.routingPath);
      let routeContexts = (match?.contexts ?? []) as string[];

      const appConfig = await buildAppConfig({
        purpose: 'page-context',
        req,
        prefix,
        url: urlObj
      });

      const requestId =
        (typeof req.headers['x-request-id'] === 'string' && req.headers['x-request-id']) ||
        (typeof (crypto as any).randomUUID === 'function' ? (crypto as any).randomUUID() : String(Date.now()));

      await runWithRequestContext(
        { requestId, purpose: 'page-context', req, prefix, url: urlObj, config: appConfig },
        async () => {
          let routeMeta = normalizeRouteMeta({ ...(match?.meta ?? {}), __ssrPath: prefix.routingPath });

      // For /api/page-context we don't need to build a real layout tree, but we DO need interceptor side effects
      // (GraphQL augmenters, product mappers, PageContext augmenters, etc.) before running any route handler fetches.
      const statusMap = buildStatusMap(enabledModules);
      const layoutNoop: any = {
        get: () => {
          throw new Error('[Layout] api.layout.get(...) is disabled. Use api.layout.at(...) instead.');
        },
        at: () => layoutNoop,
        add: () => layoutNoop
      };
      const extensionsNoop = new ExtensionsRegistry();

      const api = {
        registerComponents,
        registerProductTypeComponentStrategy,
        layout: layoutNoop,
        extend: extensionsNoop
      };

      await loadInterceptors('default', { configPath, statusMap, includeDefault: true }, api);

      if (match?.handler) {
        try {
          const handlerModule = await import(match.handler);
          const handler = handlerModule.default ?? handlerModule;
          if (typeof handler === 'function') {
            const query: Record<string, string> = {};
            for (const [k, v] of urlObj.searchParams.entries()) query[k] = v;
            const reqForHandler: any = {
              path: prefix.routingPath,
              url: routingUrl,
              query
            };
            const handlerResult =
              (await handler({
                req: reqForHandler,
                route: match,
                params: routeParams ?? {},
                store: appConfig.store ?? null
              })) || {};
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

      // Redirect shortcut (avoid unnecessary interceptor loading).
      if (isRedirectRouteMeta(routeMeta)) {
        const storeCode = (appConfig as any)?.storeCode ?? null;
        return res.status(200).json({ pageContext: { store: { code: storeCode } }, contexts: [], routeMeta });
      }
      for (const ctx of routeContexts) {
        if (ctx !== 'default') {
          await loadInterceptors(ctx, { configPath, statusMap, includeDefault: false }, api);
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
          req: { path: prefix.routingPath, url: routingUrl },
          routeMeta,
          routeContexts
        }
      );

      // Payload for SPA navigation: contexts + meta are needed to rebuild layout and avoid duplicate fetches.
      return res.status(200).json({ pageContext, contexts: routeContexts, routeMeta });
        }
      );
    } catch (error) {
      console.error('Błąd /api/page-context:', error);
      return res.status(500).json({ error: 'Internal error' });
    }
  });
};

export default {
  registerPageContextRoute
};

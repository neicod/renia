// @env: mixed
import { readAppConfig } from '@renia/framework/runtime/appConfig';

const isAbsoluteHttpUrl = (value: string): boolean =>
  value.startsWith('http://') || value.startsWith('https://');

const readRequestOrigin = (): string | null => {
  // Avoid importing server-only modules here; request context is exposed via a global getter.
  const getter = (globalThis as any).__RENIA_GET_REQUEST_CONTEXT__ as undefined | (() => any);
  if (typeof getter !== 'function') return null;
  const ctx = getter();
  const req = ctx?.req as any;
  const headers = (req?.headers ?? {}) as Record<string, unknown>;

  const host =
    (typeof headers['x-forwarded-host'] === 'string' && headers['x-forwarded-host']) ||
    (typeof headers.host === 'string' && headers.host) ||
    null;

  const proto =
    (typeof headers['x-forwarded-proto'] === 'string' && headers['x-forwarded-proto']) ||
    (typeof req?.protocol === 'string' && req.protocol) ||
    'http';

  if (!host) return null;
  return `${proto}://${host}`;
};

export const readMagentoEndpoint = (): string | undefined => {
  const cfg = readAppConfig();
  const magento = (cfg.integrations as any)?.magento ?? {};
  const graphqlEndpoint = typeof magento.graphqlEndpoint === 'string' ? magento.graphqlEndpoint : undefined;
  const proxyEndpoint = typeof magento.proxyEndpoint === 'string' ? magento.proxyEndpoint : undefined;
  const isBrowser = Boolean((globalThis as any).window);

  // Browser: prefer proxy (same-origin), then direct.
  if (isBrowser) {
    if (proxyEndpoint) return proxyEndpoint;
    if (graphqlEndpoint) return graphqlEndpoint;
    return '/api/magento/graphql';
  }

  // Server: prefer direct endpoint; use proxy only when it can be resolved to an absolute URL.
  if (graphqlEndpoint) return graphqlEndpoint;

  // As a safety net, fall back to env on the server (jobs/tests may call this without full app config).
  const envDirect =
    typeof process !== 'undefined' && process.env ? process.env.MAGENTO_GRAPHQL_ENDPOINT : undefined;
  if (envDirect) return envDirect;

  if (proxyEndpoint) {
    if (isAbsoluteHttpUrl(proxyEndpoint)) return proxyEndpoint;
    const origin = readRequestOrigin();
    if (origin) {
      try {
        return new URL(proxyEndpoint, origin).toString();
      } catch {
        // ignore
      }
    }
  }

  // Last resort (keeps tests/simple mocks working). Real deployments should always configure
  // `integrations.magento.graphqlEndpoint` (server) or at least resolve proxy to an absolute URL.
  return '/api/magento/graphql';
};

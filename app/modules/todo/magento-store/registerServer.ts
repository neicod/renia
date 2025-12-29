// @env: server
import { registerAppConfigProvider, registerPrefixResolver } from '@renia/framework/server/hooks';
import { getStoreConfig } from './services/storeConfig';

const parseJsonEnv = <T,>(name: string, fallback: T): T => {
  const raw = process.env[name];
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[MagentoStore] Invalid JSON in ${name}, using fallback`, { error });
    return fallback;
  }
};

const normalizeLeadingSlash = (path: string): string => {
  const p = String(path ?? '/');
  return p.startsWith('/') ? p : `/${p}`;
};

registerPrefixResolver((pathname) => {
  const singleStoreRaw = process.env.MAGENTO_SINGLE_STORE;
  const isSingleStore = singleStoreRaw !== '0' && singleStoreRaw !== 'false';

  const normalizedPath = normalizeLeadingSlash(pathname || '/');

  if (isSingleStore) {
    return { basePath: '', routingPath: normalizedPath };
  }

  const prefixToStore = parseJsonEnv<Record<string, string>>('MAGENTO_STORE_PREFIX_MAP', {});
  const prefixToLocale = parseJsonEnv<Record<string, string>>('MAGENTO_LOCALE_PREFIX_MAP', {});

  const [, maybePrefix] = normalizedPath.split('/', 3);
  if (!maybePrefix) return { basePath: '', routingPath: normalizedPath };

  const storeCode = prefixToStore[maybePrefix];
  if (!storeCode) return { basePath: '', routingPath: normalizedPath };

  const basePath = `/${maybePrefix}`;
  const rest = normalizedPath.slice(basePath.length) || '/';
  const routingPath = normalizeLeadingSlash(rest);

  return {
    basePath,
    routingPath,
    storeCode,
    locale: prefixToLocale[maybePrefix]
  };
});

registerAppConfigProvider(async ({ purpose, prefix }) => {
  const resolvedStoreCode = prefix.storeCode ?? process.env.MAGENTO_STORE_CODE ?? null;
  const config: Record<string, unknown> = {
    storeCode: resolvedStoreCode,
    locale: prefix.locale ?? null,
    integrations: {
      magento: {
        graphqlEndpoint: process.env.MAGENTO_GRAPHQL_ENDPOINT,
        proxyEndpoint: process.env.MAGENTO_PROXY_ENDPOINT ?? '/api/magento/graphql',
        rootCategoryId: process.env.MAGENTO_ROOT_CATEGORY_ID,
        storeCode: resolvedStoreCode,
        hostHeader: process.env.MAGENTO_HOST_HEADER,
        prefetch: {}
      }
    }
  };

  try {
    const store = await getStoreConfig();
    config.store = store;

    const magento = (config.integrations as any)?.magento;
    if (!config.storeCode && store.code) config.storeCode = store.code;
    if (magento && typeof magento === 'object' && !magento.storeCode && store.code) {
      magento.storeCode = store.code;
    }
    if (!config.locale && store.locale) {
      config.locale = store.locale;
    }
  } catch (err) {
    console.error('[MagentoStore] Failed to fetch store config', err);
  }

  if (purpose === 'ssr' && process.env.MAGENTO_GRAPHQL_ENDPOINT) {
    try {
      const { fetchMenu } = await import('renia-magento-category/services/menu');
      const rootCategoryId = process.env.MAGENTO_ROOT_CATEGORY_ID;
      const variables = rootCategoryId ? { filters: { parent_id: { eq: rootCategoryId } } } : undefined;
      const preloadedCategoryMenu = await fetchMenu({
        variables,
        headers: process.env.MAGENTO_HOST_HEADER ? { host: process.env.MAGENTO_HOST_HEADER } : undefined
      });
      const prefetch = (config.integrations as any)?.magento?.prefetch;
      if (prefetch && typeof prefetch === 'object') {
        prefetch.categoryMenu = preloadedCategoryMenu;
      }
    } catch (err) {
      console.error('[MagentoStore] Failed to prefetch category menu', err);
    }
  }

  return config;
});

export default function registerServer() {
  // Intentionally empty: this module currently only registers server hooks (prefix + appConfig provider).
}

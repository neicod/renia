// @env: mixed
export const readMagentoEndpoint = (): string | undefined => {
  const globalConfig = (globalThis as any).__APP_CONFIG__;
  const isBrowser = typeof window !== 'undefined';

  // Serwer: preferuj bezpośredni endpoint, dopiero potem proxy.
  if (!isBrowser) {
    if (globalConfig?.magentoGraphQLEndpoint) return globalConfig.magentoGraphQLEndpoint;
    if (globalConfig?.magentoProxyEndpoint) {
      const proxy = globalConfig.magentoProxyEndpoint;
      // unikamy względnych URL na serwerze
      if (proxy.startsWith('http://') || proxy.startsWith('https://')) return proxy;
    }
  }

  // Przeglądarka: najpierw proxy, potem bezpośredni endpoint.
  if (globalConfig?.magentoProxyEndpoint) return globalConfig.magentoProxyEndpoint;
  if (globalConfig?.magentoGraphQLEndpoint) return globalConfig.magentoGraphQLEndpoint;
  if (typeof window !== 'undefined') {
    const cfg = (window as any).__APP_BOOTSTRAP__?.config ?? {};
    return cfg.magentoProxyEndpoint ?? cfg.magentoGraphQLEndpoint;
  }
  return '/api/magento/graphql';
};

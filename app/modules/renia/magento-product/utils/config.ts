// @env: mixed

export const readEndpoint = (): string | undefined => {
  const globalConfig = (globalThis as any).__APP_CONFIG__;
  if (globalConfig?.magentoProxyEndpoint) return globalConfig.magentoProxyEndpoint;
  if (globalConfig?.magentoGraphQLEndpoint) return globalConfig.magentoGraphQLEndpoint;
  if (typeof window !== 'undefined') {
    const cfg = (window as any).__APP_BOOTSTRAP__?.config ?? {};
    return cfg.magentoProxyEndpoint ?? cfg.magentoGraphQLEndpoint;
  }
  return undefined;
};

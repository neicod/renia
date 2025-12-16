// @env: mixed
import type { MenuItem } from 'renia-menu';

export interface IConfigService {
  getGraphQLEndpoint(): string | undefined;
  getRootCategoryId(): string | undefined;
  getPreloadedMenu(): MenuItem[] | undefined;
}

/**
 * Service odpowiedzialny za odczyt konfiguracji aplikacji.
 * Wspiera SSR (globalThis.__APP_CONFIG__) i browser (window.__APP_BOOTSTRAP__).
 *
 * Implementuje SOLID: SRP (single responsibility - config reading)
 */
export class ConfigService implements IConfigService {
  getGraphQLEndpoint(): string | undefined {
    const globalConfig = (globalThis as any).__APP_CONFIG__;
    if (globalConfig?.magentoProxyEndpoint) return globalConfig.magentoProxyEndpoint;
    if (globalConfig?.magentoGraphQLEndpoint) return globalConfig.magentoGraphQLEndpoint;

    if (typeof window !== 'undefined') {
      const cfg = (window as any).__APP_BOOTSTRAP__?.config ?? {};
      return cfg.magentoProxyEndpoint ?? cfg.magentoGraphQLEndpoint;
    }

    return undefined;
  }

  getRootCategoryId(): string | undefined {
    const globalConfig = (globalThis as any).__APP_CONFIG__;
    if (globalConfig?.magentoRootCategoryId) return globalConfig.magentoRootCategoryId;

    if (typeof window !== 'undefined') {
      return (window as any).__APP_BOOTSTRAP__?.config?.magentoRootCategoryId;
    }

    return undefined;
  }

  getPreloadedMenu(): MenuItem[] | undefined {
    const globalConfig = (globalThis as any).__APP_CONFIG__;
    if (globalConfig?.preloadedCategoryMenu) return globalConfig.preloadedCategoryMenu;

    if (typeof window !== 'undefined') {
      return (window as any).__APP_BOOTSTRAP__?.config?.preloadedCategoryMenu;
    }

    return undefined;
  }
}

// Default instance (Singleton pattern)
export const configService = new ConfigService();

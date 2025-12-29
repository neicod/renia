// @env: mixed
import type { MenuItem } from 'renia-menu';
import { readAppConfig } from '@renia/framework/runtime/appConfig';

export interface IConfigService {
  getGraphQLEndpoint(): string | undefined;
  getRootCategoryId(): string | undefined;
  getPreloadedMenu(): MenuItem[] | undefined;
}

/**
 * Service odpowiedzialny za odczyt konfiguracji aplikacji.
 * Wspiera SSR (request-scoped config) i browser (window.__APP_BOOTSTRAP__).
 *
 * Implementuje SOLID: SRP (single responsibility - config reading)
 */
export class ConfigService implements IConfigService {
  getGraphQLEndpoint(): string | undefined {
    const cfg = readAppConfig();
    const magento = (cfg.integrations as any)?.magento ?? {};
    const proxyEndpoint = typeof magento.proxyEndpoint === 'string' ? magento.proxyEndpoint : undefined;
    const graphqlEndpoint = typeof magento.graphqlEndpoint === 'string' ? magento.graphqlEndpoint : undefined;
    if (proxyEndpoint) return proxyEndpoint;
    if (graphqlEndpoint) return graphqlEndpoint;

    return undefined;
  }

  getRootCategoryId(): string | undefined {
    const cfg = readAppConfig();
    const magento = (cfg.integrations as any)?.magento ?? {};
    const rootCategoryId = typeof magento.rootCategoryId === 'string' ? magento.rootCategoryId : undefined;
    if (rootCategoryId) return rootCategoryId;

    return undefined;
  }

  getPreloadedMenu(): MenuItem[] | undefined {
    const cfg = readAppConfig();
    const menu = (cfg.integrations as any)?.magento?.prefetch?.categoryMenu as unknown;
    return Array.isArray(menu) ? (menu as MenuItem[]) : undefined;
  }
}

// Default instance (Singleton pattern)
export const configService = new ConfigService();

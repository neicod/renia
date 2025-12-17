// @env: mixed
import { executeGraphQLRequest } from '@framework/api/graphqlClient';
import { QueryBuilder } from 'renia-graphql-client/builder';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import type { CatalogStorefrontConfig } from './storefrontConfig';
import StorefrontConfigParser, { DEFAULT_PAGE_SIZE } from './StorefrontConfigParser';

/**
 * StorefrontConfigRepository - GraphQL data access layer
 *
 * Responsibility:
 * - Execute GraphQL queries to fetch config
 * - Handle GraphQL errors
 * - Use parser to transform raw data
 * - Return strongly typed config or fallback
 *
 * No state management - pure data fetching
 */
export class StorefrontConfigRepository {
  /**
   * Build StorefrontPageSizeConfig query
   * Queries: storeConfig.grid_per_page, storeConfig.grid_per_page_values
   *
   * @returns QueryBuilder for execution
   */
  private static buildStorefrontPageSizeQuery(): QueryBuilder {
    const builder = new QueryBuilder('query').setName('StorefrontPageSizeConfig');
    builder.addField([], 'storeConfig');
    builder.addField(['storeConfig'], 'grid_per_page');
    builder.addField(['storeConfig'], 'grid_per_page_values');
    return builder;
  }

  /**
   * Fetch catalog storefront config from GraphQL API
   *
   * Process:
   * 1. Build query
   * 2. Create GraphQL request with Magento factory
   * 3. Execute request
   * 4. Check for errors
   * 5. Extract storeConfig from response
   * 6. Parse using StorefrontConfigParser
   * 7. Return config or fallback if parsing fails
   *
   * @returns CatalogStorefrontConfig (always returns value, never throws)
   */
  static async fetch(): Promise<CatalogStorefrontConfig> {
    try {
      const request = MagentoGraphQLRequestFactory.create({
        method: 'POST',
        payload: this.buildStorefrontPageSizeQuery(),
        operationId: 'magentoCatalog.storefrontConfig'
      });

      const response = await executeGraphQLRequest(request);

      if (response.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`);
      }

      const raw = ((response.data as any)?.storeConfig ?? {}) as Record<string, unknown>;
      const config = StorefrontConfigParser.extract({ raw } as any);

      return (
        config ?? {
          gridPerPage: DEFAULT_PAGE_SIZE,
          gridPerPageValues: [DEFAULT_PAGE_SIZE]
        }
      );
    } catch (error) {
      console.error('[StorefrontConfigRepository] Error fetching config:', error);
      // Return fallback instead of throwing
      return {
        gridPerPage: DEFAULT_PAGE_SIZE,
        gridPerPageValues: [DEFAULT_PAGE_SIZE]
      };
    }
  }
}

export default StorefrontConfigRepository;

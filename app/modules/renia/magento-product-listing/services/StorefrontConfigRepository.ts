// @env: mixed
import { executeGraphQLRequest } from '@framework/api/graphqlClient';
import { QueryBuilder } from 'renia-graphql-client/builder';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import type { CatalogStorefrontConfig } from './storefrontConfig';
import StorefrontConfigParser, { DEFAULT_PAGE_SIZE } from './StorefrontConfigParser';

export class StorefrontConfigRepository {
  private static buildStorefrontPageSizeQuery(): QueryBuilder {
    const builder = new QueryBuilder('query').setName('StorefrontPageSizeConfig');
    builder.addField([], 'storeConfig');
    builder.addField(['storeConfig'], 'grid_per_page');
    builder.addField(['storeConfig'], 'grid_per_page_values');
    return builder;
  }

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
      return {
        gridPerPage: DEFAULT_PAGE_SIZE,
        gridPerPageValues: [DEFAULT_PAGE_SIZE]
      };
    }
  }
}

export default StorefrontConfigRepository;


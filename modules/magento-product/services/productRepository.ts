// @env: mixed
import { executeRequest } from 'renia-graphql-client';
import type { SearchCriteria, SearchResults } from '@framework/api';
import type { Product, ProductSortOption } from '../types';
import { fetchProduct } from './product';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { PRODUCT_SEARCH_QUERY } from './queries';
import { QueryBuilder } from 'renia-graphql-client/builder';

type FilterValue = string | number | boolean | (string | number | boolean)[];

const mapProduct = (item: any): Product => ({
  id: String(item?.id ?? item?.sku ?? Math.random()),
  sku: item?.sku ?? '',
  name: item?.name ?? '',
  urlKey: item?.url_key ?? undefined,
  urlPath: item?.url_path ?? undefined,
  thumbnail: item?.small_image?.url
    ? { url: item.small_image.url, label: item.small_image?.label }
    : undefined,
  price: item?.price_range?.minimum_price?.final_price
    ? {
        value: item.price_range.minimum_price.final_price.value,
        currency: item.price_range.minimum_price.final_price.currency
      }
    : undefined,
  priceOriginal: item?.price_range?.minimum_price?.regular_price
    ? {
        value: item.price_range.minimum_price.regular_price.value,
        currency: item.price_range.minimum_price.regular_price.currency
      }
    : undefined
});

export type ProductSearchResults = SearchResults<Product> & {
  sortOptions?: ProductSortOption[];
  defaultSort?: string;
};

export class ProductRepository {
  private factory: MagentoGraphQLRequestFactory;

  constructor() {
    this.factory = new MagentoGraphQLRequestFactory();
  }

  private mapCondition(condition?: string): string {
    const allowed = new Set([
      'eq',
      'neq',
      'like',
      'in',
      'nin',
      'gt',
      'lt',
      'gteq',
      'lteq'
    ]);
    const normalized = typeof condition === 'string' ? condition.toLowerCase() : 'eq';
    return allowed.has(normalized) ? normalized : 'eq';
  }

  private buildFilterInput(criteria: SearchCriteria): Record<string, any> | undefined {
    const filterGroups = criteria.filterGroups ?? [];
    const filter: Record<string, any> = {};

    filterGroups.forEach((group) => {
      (group.filters ?? []).forEach((f) => {
        const condition = this.mapCondition(f.conditionType);
        filter[f.field] = { [condition]: f.value };
      });
    });

    return Object.keys(filter).length ? filter : undefined;
  }

  private buildSortInput(criteria: SearchCriteria): Record<string, any> | undefined {
    if (!criteria.sortOrders || !criteria.sortOrders.length) return undefined;
    const sort: Record<string, any> = {};
    criteria.sortOrders.forEach((s) => {
      sort[s.field] = s.direction === 'DESC' ? 'DESC' : 'ASC';
    });
    return Object.keys(sort).length ? sort : undefined;
  }

  async getByUrlKey(urlKey: string): Promise<Product | null> {
    try {
      return await fetchProduct({ urlKey });
    } catch (error) {
      console.error('Error fetching product by urlKey', error);
      return null;
    }
  }

  async getList(criteria: SearchCriteria): Promise<ProductSearchResults> {
    const pageSize = criteria.pageSize ?? 12;
    const currentPage = criteria.currentPage ?? 1;

    const headers: Record<string, string> = {};

    const variables = {
      filter: this.buildFilterInput(criteria),
      pageSize,
      currentPage,
      sort: this.buildSortInput(criteria)
    };

    const query = new QueryBuilder(PRODUCT_SEARCH_QUERY).toString();

    const req = this.factory.create({
      method: 'POST',
      payload: query,
      headers,
      variables
    });

    const res = await executeRequest(req);
    if (res.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
    }

    const data = (res.data as any)?.products;
    const items = Array.isArray(data?.items) ? data.items.map(mapProduct) : [];
    const total = typeof data?.total_count === 'number' ? data.total_count : items.length;
    const sortFields = data?.sort_fields;
    const sortOptions: ProductSortOption[] | undefined = Array.isArray(sortFields?.options)
      ? sortFields.options
          .map((opt: any) =>
            typeof opt?.value === 'string' && typeof opt?.label === 'string'
              ? { value: opt.value, label: opt.label }
              : null
          )
          .filter(Boolean) as ProductSortOption[]
      : undefined;
    const defaultSort =
      typeof sortFields?.default === 'string' && sortFields.default.length
        ? sortFields.default
        : undefined;

    return {
      items,
      totalCount: total,
      searchCriteria: criteria,
      sortOptions,
      defaultSort
    };
  }
}

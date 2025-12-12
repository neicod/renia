// @env: mixed
import { executeRequest } from 'renia-graphql-client';
import { QueryBuilder } from 'renia-graphql-client/builder';
import type { SearchCriteria, SearchResults } from '@framework/api';
import { fetchMenu } from './menu';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { CATEGORY_BY_URL_PATH, CATEGORY_BY_UID } from './categoryQueries';
import { mapCategoryNode } from './categoryMapper';

export interface Category {
  id: string;
  label: string;
  url: string;
  urlPath?: string;
  type?: string;
  position?: number;
  includeInMenu?: boolean;
  children?: Category[];
}

export class CategoryRepository {
  private endpoint: string;
  private factory: MagentoGraphQLRequestFactory;

  constructor() {
    this.factory = new MagentoGraphQLRequestFactory();
    this.endpoint = this.factory.getEndpoint();
  }

  async getByUid(uid: string): Promise<Category | null> {
    const query = new QueryBuilder(CATEGORY_BY_UID).toString();

    const req = this.factory.create({
      method: 'POST',
      payload: query,
      variables: { uid }
    });

    const res = await executeRequest(req);
    if (res.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
    }
    const items = (res.data as any)?.categories?.items ?? [];
    return items.length ? mapCategoryNode(items[0]) : null;
  }

  async getByUrlPath(urlPath: string): Promise<Category | null> {
    const cleaned = urlPath.replace(/^\/+|\/+$/g, '');

    const query = new QueryBuilder(CATEGORY_BY_URL_PATH).toString();

    const req = this.factory.create({
      method: 'POST',
      payload: query,
      variables: { path: cleaned }
    });

    const res = await executeRequest(req);
    if (res.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
    }
    const items = (res.data as any)?.categories?.items ?? [];
    return items.length ? mapCategoryNode(items[0]) : null;
  }

  async getList(criteria: SearchCriteria): Promise<SearchResults<Category>> {
    const filterGroups = criteria.filterGroups ?? [];
    const first = filterGroups[0]?.filters?.find((f) => f.field === 'parent_id' || f.field === 'uid');
    const parentId =
      typeof first?.value === 'string' || typeof first?.value === 'number'
        ? String(first.value)
        : undefined;

    const items = await fetchMenu({
      variables: parentId ? { filters: { parent_id: { eq: parentId } } } : undefined
    });

    return {
      items,
      totalCount: items.length,
      searchCriteria: criteria
    };
  }
}

export const createCategoryRepository = () => new CategoryRepository();

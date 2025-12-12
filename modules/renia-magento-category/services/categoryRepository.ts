// @env: mixed
import { executeGraphQLRequest } from '@framework/api/graphqlClient';
import { QueryBuilder } from 'renia-graphql-client/builder';
import type { SearchCriteria, SearchResults } from '@framework/api';
import { fetchMenu } from './menu';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { CATEGORY_BY_URL_PATH, CATEGORY_BY_UID } from './categoryQueries';
import { mapCategoryNode } from './categoryMapper';
import type { Category } from '../types/category';

export class CategoryRepository {
  async getByUid(uid: string): Promise<Category | null> {
    const query = new QueryBuilder(CATEGORY_BY_UID).toString();

    const req = MagentoGraphQLRequestFactory.create({
      method: 'POST',
      payload: query,
      variables: { uid },
      operationId: 'magentoCategory.byUid'
    });

    const res = await executeGraphQLRequest(req);
    if (res.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
    }
    const items = (res.data as any)?.categories?.items ?? [];
    return items.length ? mapCategoryNode(items[0]) : null;
  }

  async getByUrlPath(urlPath: string): Promise<Category | null> {
    const cleaned = urlPath.replace(/^\/+|\/+$/g, '');

    const query = new QueryBuilder(CATEGORY_BY_URL_PATH).toString();

    const req = MagentoGraphQLRequestFactory.create({
      method: 'POST',
      payload: query,
      variables: { path: cleaned },
      operationId: 'magentoCategory.byUrlPath'
    });

    const res = await executeGraphQLRequest(req);
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

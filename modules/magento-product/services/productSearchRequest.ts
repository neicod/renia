// @env: mixed
import type { SearchCriteria } from '@framework/api';
import { QueryBuilder } from 'renia-graphql-client/builder';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { PRODUCT_SEARCH_QUERY } from './queries';
import { buildFilterInput, buildSortInput } from './productSearchTransforms';

const DEFAULT_PAGE_SIZE = 12;

export const createProductSearchRequest = (criteria: SearchCriteria) => {
  const pageSize = criteria.pageSize ?? DEFAULT_PAGE_SIZE;
  const currentPage = criteria.currentPage ?? 1;

  const variables = {
    filter: buildFilterInput(criteria),
    search: criteria.search,
    pageSize,
    currentPage,
    sort: buildSortInput(criteria)
  };

  const query = new QueryBuilder(PRODUCT_SEARCH_QUERY).toString();

  return MagentoGraphQLRequestFactory.create({
    method: 'POST',
    payload: query,
    headers: {},
    variables
  });
};

export default createProductSearchRequest;

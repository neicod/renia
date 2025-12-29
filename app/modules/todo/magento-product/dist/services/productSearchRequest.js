import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { buildProductSearchQuery } from './queries.js';
import { buildFilterInput, buildSortInput } from './productSearchTransforms.js';
const DEFAULT_PAGE_SIZE = 12;
export const createProductSearchRequest = (criteria) => {
    const pageSize = criteria.pageSize ?? DEFAULT_PAGE_SIZE;
    const currentPage = criteria.currentPage ?? 1;
    const variables = {
        filter: buildFilterInput(criteria),
        search: criteria.search,
        pageSize,
        currentPage,
        sort: buildSortInput(criteria)
    };
    return MagentoGraphQLRequestFactory.create({
        method: 'POST',
        payload: buildProductSearchQuery(),
        headers: {},
        variables,
        operationId: 'magentoProduct.search'
    });
};
export default createProductSearchRequest;

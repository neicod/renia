// @env: mixed
import { executeGraphQLRequest } from '@renia/framework/api/graphqlClient';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { buildProductDetailQuery } from './queries.js';
import { mapProduct } from './productMapper.js';
import { getLogger } from 'renia-logger';
const logger = getLogger();
export const fetchProduct = async (options) => {
    if (!options.urlKey && !options.sku) {
        throw new Error('fetchProduct: wymagany urlKey lub sku');
    }
    const filters = options.urlKey
        ? `url_key: { eq: "${options.urlKey}" }`
        : `sku: { eq: "${options.sku}" }`;
    const headers = { ...(options.headers ?? {}) };
    const req = MagentoGraphQLRequestFactory.create({
        method: 'POST',
        payload: buildProductDetailQuery(filters),
        headers,
        timeoutMs: options.timeoutMs,
        operationId: 'magentoProduct.detail'
    });
    const res = await executeGraphQLRequest(req);
    if (res.errors) {
        logger.error('fetchProduct', 'GraphQL errors', { errors: res.errors });
        throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
    }
    const items = res.data?.products?.items ?? [];
    if (!items.length) {
        logger.warn('fetchProduct', 'No items returned');
        return null;
    }
    try {
        return mapProduct(items[0]);
    }
    catch (err) {
        logger.error('fetchProduct', 'Error mapping product', { error: err instanceof Error ? err.message : String(err) });
        throw err;
    }
};
export default {
    fetchProduct
};

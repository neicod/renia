// @env: server
import type { SearchCriteria } from '@renia/framework/api';
import { productRepository } from 'renia-magento-product';
import type { ProductSearchResults } from 'renia-magento-product';

export const prefetchProductListing = async (
  criteria: SearchCriteria
): Promise<ProductSearchResults> => {
  const res = await productRepository.getList(criteria);
  // Ensure serializable payload for SSR bootstrap
  return JSON.parse(JSON.stringify(res)) as ProductSearchResults;
};

export default prefetchProductListing;


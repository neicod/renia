// @env: mixed
import type { Product, ProductInterface, ProductMapperInterface } from '../types.js';
import { mapCommonProductFields } from './productMapperShared.js';

// Registry for product type mappers
const productMapperRegistry = new Map<string, ProductMapperInterface>();

/**
 * Default mapper for simple/virtual products
 * Uses shared mapping utilities for common fields
 */
const simpleProductMapper: ProductMapperInterface = {
  map(item: any): Product {
    return {
      ...mapCommonProductFields(item),
      __typename: item?.__typename ?? 'SimpleProduct'
    };
  }
};

/**
 * Register a custom mapper for a product type
 * @example registerProductMapper('ConfigurableProduct', configurableProductMapper)
 */
export const registerProductMapper = (
  productType: string,
  mapper: ProductMapperInterface
) => {
  productMapperRegistry.set(productType, mapper);
};

/**
 * Map product data based on its __typename
 * Uses registered mappers, falls back to simple product mapper
 */
export const mapProduct = (item: any): ProductInterface => {
  const productType = item?.__typename ?? 'SimpleProduct';
  const mapper = productMapperRegistry.get(productType) ?? simpleProductMapper;
  return mapper.map(item);
};

export default mapProduct;

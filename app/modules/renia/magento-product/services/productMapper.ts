// @env: mixed
import type { Product, ProductInterface, ProductMapperInterface } from '../types';

// Registry for product type mappers
const productMapperRegistry = new Map<string, ProductMapperInterface>();

/**
 * Default mapper for simple/virtual products
 */
const simpleProductMapper: ProductMapperInterface = {
  map(item: any): Product {
    return {
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
        : undefined,
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

// @env: mixed
import type { ProductMedia, ProductPrice } from '../types';

/**
 * Shared product mapping utilities
 *
 * Extracted common logic from simpleProductMapper and configurableMapper
 * Eliminates 40+ lines of code duplication
 *
 * Pure functions - no side effects
 */

/**
 * Map product thumbnail image
 * Handles: missing data, null values gracefully
 */
export const mapProductThumbnail = (image: any): ProductMedia | undefined => {
  if (!image?.url) return undefined;
  return {
    url: image.url,
    label: image.label
  };
};

/**
 * Map product price from price_range
 * Handles: minimum_price, final_price structure
 * Used by both simple and configurable products
 */
export const mapProductPrice = (priceRange: any): ProductPrice | undefined => {
  if (!priceRange?.minimum_price?.final_price) return undefined;
  return {
    value: priceRange.minimum_price.final_price.value,
    currency: priceRange.minimum_price.final_price.currency
  };
};

/**
 * Map product original/regular price
 * Used for showing discounted prices
 */
export const mapProductPriceOriginal = (priceRange: any): ProductPrice | undefined => {
  if (!priceRange?.minimum_price?.regular_price) return undefined;
  return {
    value: priceRange.minimum_price.regular_price.value,
    currency: priceRange.minimum_price.regular_price.currency
  };
};

/**
 * Map common product fields (id, sku, name, urls, media, price)
 * Shared between simple and configurable products
 *
 * @param item Raw product data from API
 * @returns Object with common product fields
 */
export const mapCommonProductFields = (item: any) => {
  return {
    id: String(item?.id ?? item?.sku ?? Math.random()),
    sku: item?.sku ?? '',
    name: item?.name ?? '',
    urlKey: item?.url_key ?? undefined,
    urlPath: item?.url_path ?? undefined,
    thumbnail: mapProductThumbnail(item?.small_image),
    price: mapProductPrice(item?.price_range),
    priceOriginal: mapProductPriceOriginal(item?.price_range)
  };
};

export default {
  mapProductThumbnail,
  mapProductPrice,
  mapProductPriceOriginal,
  mapCommonProductFields
};

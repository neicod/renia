import type { ProductMedia, ProductPrice } from '../types.js';
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
export declare const mapProductThumbnail: (image: any) => ProductMedia | undefined;
/**
 * Map product price from price_range
 * Handles: minimum_price, final_price structure
 * Used by both simple and configurable products
 */
export declare const mapProductPrice: (priceRange: any) => ProductPrice | undefined;
/**
 * Map product original/regular price
 * Used for showing discounted prices
 */
export declare const mapProductPriceOriginal: (priceRange: any) => ProductPrice | undefined;
/**
 * Map common product fields (id, sku, name, urls, media, price)
 * Shared between simple and configurable products
 *
 * @param item Raw product data from API
 * @returns Object with common product fields
 */
export declare const mapCommonProductFields: (item: any) => {
    id: string;
    sku: any;
    name: any;
    urlKey: any;
    urlPath: any;
    thumbnail: ProductMedia | undefined;
    price: ProductPrice | undefined;
    priceOriginal: ProductPrice | undefined;
};
declare const _default: {
    mapProductThumbnail: (image: any) => ProductMedia | undefined;
    mapProductPrice: (priceRange: any) => ProductPrice | undefined;
    mapProductPriceOriginal: (priceRange: any) => ProductPrice | undefined;
    mapCommonProductFields: (item: any) => {
        id: string;
        sku: any;
        name: any;
        urlKey: any;
        urlPath: any;
        thumbnail: ProductMedia | undefined;
        price: ProductPrice | undefined;
        priceOriginal: ProductPrice | undefined;
    };
};
export default _default;
//# sourceMappingURL=productMapperShared.d.ts.map
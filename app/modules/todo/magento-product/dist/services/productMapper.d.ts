import type { ProductInterface, ProductMapperInterface } from '../types.js';
/**
 * Register a custom mapper for a product type
 * @example registerProductMapper('ConfigurableProduct', configurableProductMapper)
 */
export declare const registerProductMapper: (productType: string, mapper: ProductMapperInterface) => void;
/**
 * Map product data based on its __typename
 * Uses registered mappers, falls back to simple product mapper
 */
export declare const mapProduct: (item: any) => ProductInterface;
export default mapProduct;
//# sourceMappingURL=productMapper.d.ts.map
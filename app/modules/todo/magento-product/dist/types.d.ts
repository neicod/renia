export type ProductPrice = {
    value: number;
    currency: string;
};
export type ProductMedia = {
    url: string;
    label?: string;
};
export interface ProductInterface {
    id: string;
    sku: string;
    name: string;
    urlKey?: string;
    urlPath?: string;
    thumbnail?: ProductMedia;
    price?: ProductPrice;
    priceOriginal?: ProductPrice;
    __typename: string;
}
export type Product = ProductInterface & {
    __typename: 'SimpleProduct';
};
export type ProductSortOption = {
    value: string;
    label: string;
};
/**
 * Interface for product type mappers
 * Implementations handle conversion of raw GraphQL data to typed ProductInterface
 */
export interface ProductMapperInterface {
    /**
     * Map raw GraphQL product data to typed ProductInterface
     * @param data Raw product data from GraphQL API
     * @returns Mapped product data
     */
    map(data: any): ProductInterface;
}
//# sourceMappingURL=types.d.ts.map
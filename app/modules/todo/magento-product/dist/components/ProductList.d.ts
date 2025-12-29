import React from 'react';
import type { ProductInterface } from '../types.js';
type ProductListProps = {
    products: ProductInterface[];
    loading?: boolean;
    initialLoading?: boolean;
    error?: string | null;
    emptyLabel?: string;
};
export declare const ProductList: React.FC<ProductListProps>;
export default ProductList;
//# sourceMappingURL=ProductList.d.ts.map
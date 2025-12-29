import type { ProductInterface } from '../types.js';
type FetchProductOptions = {
    urlKey?: string;
    sku?: string;
    headers?: Record<string, string>;
    timeoutMs?: number;
};
export declare const fetchProduct: (options: FetchProductOptions) => Promise<ProductInterface | null>;
declare const _default: {
    fetchProduct: (options: FetchProductOptions) => Promise<ProductInterface | null>;
};
export default _default;
//# sourceMappingURL=product.d.ts.map
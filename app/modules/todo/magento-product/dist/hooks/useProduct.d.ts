import type { ProductInterface } from '../types.js';
export type UseProductOptions = {
    urlKey?: string | null;
};
type Status = 'idle' | 'loading' | 'ready' | 'error';
export declare const useProduct: ({ urlKey }: UseProductOptions) => {
    product: ProductInterface | null;
    status: Status;
};
export default useProduct;
//# sourceMappingURL=useProduct.d.ts.map
import type { ComponentType } from 'react';
/**
 * Product Type Component Strategy
 * key -> productType -> Component
 */
export type ProductTypeComponentStrategy = {
    key: string;
    components: Record<string, ComponentType<any>>;
};
export declare const registerProductTypeComponentStrategy: (strategy: ProductTypeComponentStrategy) => void;
export declare const getProductTypeComponent: (productType: string, key: string) => ComponentType<any> | null;
export declare const listProductTypeStrategies: () => Record<string, Record<string, string>>;
declare const _default: {
    registerProductTypeComponentStrategy: (strategy: ProductTypeComponentStrategy) => void;
    getProductTypeComponent: (productType: string, key: string) => ComponentType<any> | null;
    listProductTypeStrategies: () => Record<string, Record<string, string>>;
};
export default _default;
//# sourceMappingURL=productTypeStrategies.d.ts.map
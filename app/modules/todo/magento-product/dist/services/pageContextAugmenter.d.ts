import type { ProductInterface } from '../types.js';
declare module '@renia/framework/runtime/PageContext' {
    interface PageContextExtensions {
        product?: {
            product?: ProductInterface | null;
            productUrlKey?: string | null;
        };
    }
}
export declare const registerProductPageContextAugmenter: () => void;
declare const _default: {
    registerProductPageContextAugmenter: () => void;
};
export default _default;
//# sourceMappingURL=pageContextAugmenter.d.ts.map
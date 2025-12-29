import type { SearchCriteria } from '@renia/framework/api';
import type { ProductSearchResults } from './productSearchResults.js';
declare const getList: (criteria: SearchCriteria) => Promise<ProductSearchResults>;
export type ProductRepository = {
    getList: typeof getList;
};
export declare const productRepository: ProductRepository;
export {};
//# sourceMappingURL=productRepository.d.ts.map
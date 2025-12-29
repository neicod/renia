import type { SearchResults } from '@renia/framework/api';
import type { ProductInterface, ProductSortOption } from '../types.js';
export type ProductSearchResults = SearchResults<ProductInterface> & {
    sortOptions?: ProductSortOption[];
    defaultSort?: string;
};
export default ProductSearchResults;
//# sourceMappingURL=productSearchResults.d.ts.map
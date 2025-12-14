// @env: mixed
import type { SearchResults } from '@framework/api';
import type { Product, ProductInterface, ProductSortOption } from '../types';

export type ProductSearchResults = SearchResults<ProductInterface> & {
  sortOptions?: ProductSortOption[];
  defaultSort?: string;
};

export default ProductSearchResults;

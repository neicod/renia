// @env: mixed
import type { SearchResults } from '@framework/api';
import type { Product, ProductSortOption } from '../types';

export type ProductSearchResults = SearchResults<Product> & {
  sortOptions?: ProductSortOption[];
  defaultSort?: string;
};

export default ProductSearchResults;

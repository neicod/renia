// @env: mixed
import type { SearchCriteria } from '@framework/api';
import type { ProductSortOption } from '../types';
import type { ProductSearchResults } from './productSearchResults';
import { mapProduct } from './productMapper';
import { getLogger } from 'renia-logger';

const logger = getLogger();

// Ensure configurable product augmenter is loaded on client-side
// This runs before any GraphQL queries are executed
import('renia-magento-configurable-product/services/configurableQueryAugmenter').then(() => {
  logger.debug('productSearchResponse', 'Configurable product augmenter loaded successfully');
}).catch((error) => {
  logger.warn('productSearchResponse', 'Configurable product augmenter not available - configurable products may not render options', {
    error: error instanceof Error ? error.message : String(error)
  });
});

type GraphQLProductsPayload = {
  items?: any[];
  total_count?: number;
  sort_fields?: {
    options?: ProductSortOption[];
    default?: string;
  };
};

const mapSortOptions = (sortFields?: GraphQLProductsPayload['sort_fields']) => {
  if (!Array.isArray(sortFields?.options)) return undefined;
  return sortFields.options
    .map((opt: any) =>
      typeof opt?.value === 'string' && typeof opt?.label === 'string'
        ? { value: opt.value, label: opt.label }
        : null
    )
    .filter(Boolean) as ProductSortOption[];
};

export const mapProductSearchResponse = (
  payload: any,
  criteria: SearchCriteria
): ProductSearchResults => {
  const data: GraphQLProductsPayload = payload?.products ?? payload ?? {};

  const items = Array.isArray(data.items) ? data.items.map(mapProduct) : [];
  const total =
    typeof data.total_count === 'number' && Number.isFinite(data.total_count)
      ? data.total_count
      : items.length;

  return {
    items,
    totalCount: total,
    searchCriteria: criteria,
    sortOptions: mapSortOptions(data.sort_fields),
    defaultSort:
      typeof data.sort_fields?.default === 'string' && data.sort_fields.default.length
        ? data.sort_fields.default
        : undefined
  };
};

export default mapProductSearchResponse;

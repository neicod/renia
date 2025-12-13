// @env: mixed
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProductSearchResults } from 'magento-product';
import { ProductList } from 'magento-product/components/ProductList';
import { ProductListingToolbar, ProductListingPagination } from 'renia-magento-catalog';
import { useSearchProductList } from '../hooks/useSearchProductList';
import { useI18n } from 'renia-i18n/hooks/useI18n';

type SearchMeta = {
  type?: string;
  searchQuery?: string;
  searchProductListing?: ProductSearchResults | null;
};

type Props = {
  meta?: SearchMeta;
  initialListing?: ProductSearchResults | null;
};

const useQueryParam = (meta?: SearchMeta) => {
  const [params] = useSearchParams();
  const urlQuery = params.get('q') ?? params.get('query');
  const metaQuery = typeof meta?.searchQuery === 'string' ? meta.searchQuery : undefined;
  return (urlQuery ?? metaQuery ?? '').trim();
};

export const SearchProductList: React.FC<Props> = ({ meta, initialListing: initialListingProp }) => {
  if (meta && meta.type && meta.type !== 'search') {
    return null;
  }
  const { t } = useI18n();
  const query = useQueryParam(meta);
  const initialListing = React.useMemo(
    () => initialListingProp ?? meta?.searchProductListing ?? null,
    [initialListingProp, meta]
  );

  const {
    status,
    isInitialLoading,
    listing: { products, total, sort, sortOptions, page, pageSize, pageSizeOptions },
    handlers: { onSortChange, onItemsPerPageChange, onPageChange }
  } = useSearchProductList({ query, initialListing });

  if (!query) {
    return (
      <div style={{ padding: '1rem 0' }}>
        <h2 style={{ margin: '0 0 0.5rem' }}>{t('search.title')}</h2>
        <p style={{ margin: 0, color: '#4b5563' }}>{t('search.hint')}</p>
      </div>
    );
  }

  const controlsDisabled = status === 'loading';

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{t('search.results', { query })}</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#4b5563' }}>
          {t(total === 1 ? 'search.found.one' : 'search.found.many', { total })}
        </p>
      </div>
      <ProductListingToolbar
        sortOptions={sortOptions}
        selectedSort={sort}
        onSortChange={onSortChange}
        totalItems={total}
        currentPage={page}
        itemsPerPage={pageSize}
        pageSizeOptions={pageSizeOptions}
        onItemsPerPageChange={onItemsPerPageChange}
        disabled={controlsDisabled}
      />
      <ProductList
        products={products}
        loading={status === 'loading'}
        initialLoading={isInitialLoading}
        error={status === 'error' ? t('search.error') : null}
        emptyLabel={t('search.empty')}
      />
      <ProductListingPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        disabled={controlsDisabled}
      />
    </div>
  );
};

export default SearchProductList;

// @env: mixed
import React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { ProductSearchResults } from 'renia-magento-product';
import { ListingPageContent } from 'renia-magento-product-listing/components/ListingPageContent';
import { useSearchProductList } from '../hooks/useSearchProductList';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { normalizeSearchTermKey } from '@renia/framework/router/listingQuery';

type SearchMeta = {
  type?: string;
  searchQuery?: string;
  searchProductListing?: ProductSearchResults | null;
};

type Props = {
  meta?: SearchMeta;
  initialListing?: ProductSearchResults | null;
};

/**
 * Extract query from URL params and meta
 */
const useQueryParam = (meta?: SearchMeta) => {
  const [params] = useSearchParams();
  const urlQuery = params.get('q') ?? params.get('query');
  const metaQuery = typeof meta?.searchQuery === 'string' ? meta.searchQuery : undefined;
  return (urlQuery ?? metaQuery ?? '').trim();
};

/**
 * SearchProductList - Search listing page orchestrator
 *
 * Responsibility:
 * - Extract search query from URL params
 * - Handle empty query state
 * - Call useSearchProductList hook
 * - Render header with search results title
 * - Delegate listing UI to ListingPageContent
 */
export const SearchProductList: React.FC<Props> = ({ meta, initialListing: initialListingProp }) => {
  if (meta && meta.type && meta.type !== 'search') {
    return null;
  }

  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Canonicalize legacy search param key: `query` -> `q`.
    const normalizedKey = normalizeSearchTermKey(location.search);

    // If SSR/meta provided query, persist it in the URL for shareability and consistency.
    const params = new URLSearchParams(normalizedKey.startsWith('?') ? normalizedKey.slice(1) : normalizedKey);
    const qInUrl = (params.get('q') ?? '').trim();
    const metaQuery = typeof meta?.searchQuery === 'string' ? meta.searchQuery.trim() : '';
    if (!qInUrl && metaQuery) {
      params.set('q', metaQuery);
    }

    const out = params.toString();
    const nextSearch = out ? `?${out}` : '';

    if (nextSearch !== location.search) {
      navigate(`${location.pathname}${nextSearch}${location.hash ?? ''}`, { replace: true });
    }
  }, [location.hash, location.pathname, location.search, meta?.searchQuery, navigate]);

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

  // Empty state: no query entered
  if (!query) {
    return (
      <div style={{ padding: '1rem 0' }}>
        <h2 style={{ margin: '0 0 0.5rem' }}>{t('search.title')}</h2>
        <p style={{ margin: 0, color: '#4b5563' }}>{t('search.hint')}</p>
      </div>
    );
  }

  return (
    <ListingPageContent
      products={products}
      total={total}
      currentPage={page}
      pageSize={pageSize}
      sortOptions={sortOptions}
      selectedSort={sort}
      onSortChange={onSortChange}
      pageSizeOptions={pageSizeOptions}
      onItemsPerPageChange={onItemsPerPageChange}
      onPageChange={onPageChange}
      isLoading={status === 'loading'}
      isInitialLoading={isInitialLoading}
      hasError={status === 'error'}
      errorMessage={t('search.error')}
      emptyMessage={t('search.empty')}
      header={
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{t('search.results', { query })}</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#4b5563' }}>
            {t(total === 1 ? 'search.found.one' : 'search.found.many', { total })}
          </p>
        </div>
      }
    />
  );
};

export default SearchProductList;

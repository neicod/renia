// @env: mixed
import React from 'react';
import type { ProductInterface } from '../types.js';
import { ProductTile } from './ProductTile.js';

type ProductListProps = {
  products: ProductInterface[];
  loading?: boolean;
  initialLoading?: boolean;
  error?: string | null;
  emptyLabel?: string;
};

export const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  initialLoading = false,
  error,
  emptyLabel = 'Brak produktów w tej kategorii'
}) => {
  const isRefreshing = Boolean(loading) && products.length > 0;

  if (error && products.length === 0) {
    return <div style={{ color: '#b91c1c' }}>Błąd: {error}</div>;
  }
  if (initialLoading) {
    return <div style={{ color: '#6b7280' }}>Ładowanie produktów...</div>;
  }
  if (!products.length) {
    return <div style={{ color: '#6b7280' }}>{emptyLabel}</div>;
  }

  return (
    <div>
      {error && (
        <div style={{ color: '#b91c1c', marginBottom: '0.5rem' }}>Błąd: {error}</div>
      )}
      <div className="product-gridWrap">
        <div className="product-grid" data-loading={loading && products.length === 0 ? 'true' : 'false'}>
          {products.map((p) => (
            <ProductTile key={p.id} product={p} />
          ))}
        </div>
        {isRefreshing ? (
          <div className="product-gridOverlay" aria-hidden="true">
            <div className="product-gridOverlay__pill">Aktualizuję…</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProductList;

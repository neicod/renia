// @env: mixed
import React from 'react';
import type { Product } from '../types';
import { ProductTile } from './ProductTile';

type ProductListProps = {
  products: Product[];
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
      <div
        data-loading={loading ? 'true' : 'false'}
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))'
        }}
      >
        {products.map((p) => (
          <ProductTile key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;

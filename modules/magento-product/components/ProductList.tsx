// @env: mixed
import React from 'react';
import type { Product } from '../types';
import { ProductTile } from './ProductTile';

type ProductListProps = {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  emptyLabel?: string;
};

export const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  error,
  emptyLabel = 'Brak produktów w tej kategorii'
}) => {
  if (loading) {
    return <div style={{ color: '#6b7280' }}>Ładowanie produktów...</div>;
  }
  if (error) {
    return <div style={{ color: '#b91c1c' }}>Błąd: {error}</div>;
  }
  if (!products.length) {
    return <div style={{ color: '#6b7280' }}>{emptyLabel}</div>;
  }

  return (
    <div
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
  );
};

export default ProductList;

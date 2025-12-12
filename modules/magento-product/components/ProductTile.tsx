// @env: mixed
import React from 'react';
import type { Product } from '../types';

type ProductTileProps = {
  product: Product;
};

export const ProductTile: React.FC<ProductTileProps> = ({ product }) => {
  return (
    <div
      style={{
        display: 'grid',
        gap: '0.5rem',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '0.9rem',
        background: '#ffffff',
        boxShadow: '0 10px 20px rgba(15, 23, 42, 0.06)'
      }}
    >
      {product.thumbnail?.url ? (
        <div
          style={{
            aspectRatio: '4 / 5',
            overflow: 'hidden',
            borderRadius: '10px',
            background: '#f8fafc'
          }}
        >
          <img
            src={product.thumbnail.url}
            alt={product.thumbnail.label ?? product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : null}
      <div style={{ display: 'grid', gap: '0.2rem' }}>
        <a href={`/product/${product.urlKey ?? product.sku}`} style={{ fontWeight: 700, color: '#0f172a' }}>
          {product.name}
        </a>
        {product.price ? (
          <div style={{ fontWeight: 700, color: '#2563eb' }}>
            {product.price.value.toFixed(2)} {product.price.currency}
          </div>
        ) : (
          <div style={{ color: '#64748b', fontWeight: 600 }}>Cena dostępna w koszyku</div>
        )}
      </div>
    </div>
  );
};

export default ProductTile;

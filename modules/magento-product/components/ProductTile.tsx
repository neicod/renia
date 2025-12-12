// @env: mixed
import React from 'react';
import type { Product } from '../types';

type ProductTileProps = {
  product: Product;
};

export const ProductTile: React.FC<ProductTileProps> = ({ product }) => {
  const link = `/product/${product.urlKey ?? product.sku}`;
  return (
    <article
      style={{
        display: 'grid',
        gap: '0.75rem',
        borderRadius: '14px',
        padding: '1.1rem',
        background: '#ffffff',
        border: '1px solid #e4eaf5',
        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
        transition: 'transform 160ms ease, box-shadow 160ms ease'
      }}
    >
      {product.thumbnail?.url ? (
        <a
          href={link}
          style={{
            display: 'block',
            aspectRatio: '4 / 5',
            overflow: 'hidden',
            borderRadius: '12px',
            background: '#f4f6fb',
            border: '1px solid #edf1fb'
          }}
        >
          <img
            src={product.thumbnail.url}
            alt={product.thumbnail.label ?? product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </a>
      ) : null}
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        <a
          href={link}
          style={{
            fontWeight: 700,
            color: '#0f172a',
            fontSize: '1rem',
            lineHeight: 1.35
          }}
        >
          {product.name}
        </a>
        {product.price ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              background: 'rgba(76, 110, 245, 0.12)',
              color: '#364fc7',
              fontWeight: 600,
              fontSize: '0.95rem',
              width: 'fit-content'
            }}
          >
            {product.price.value.toFixed(2)} {product.price.currency}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontWeight: 600 }}>Cena dostępna w koszyku</div>
        )}
        <a
          href={link}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '999px',
            border: '1px solid #dbe4ff',
            color: '#1e3a8a',
            fontSize: '0.9rem',
            width: 'fit-content',
            fontWeight: 600
          }}
        >
          Zobacz produkt
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </article>
  );
};

export default ProductTile;

// @env: mixed
import React from 'react';
import type { Product } from '../../types';

type Props = {
  product: Product;
};

export const ProductDetails: React.FC<Props> = ({ product }) => {
  const price = product.price
    ? `${product.price.value.toFixed(2)} ${product.price.currency}`
    : 'Cena dostępna w koszyku';

  const originalDiffers =
    product.priceOriginal && product.price && product.priceOriginal.value !== product.price.value;

  return (
    <section className="card" style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>{product.name}</h1>
        <div style={{ color: '#2563eb', fontWeight: 700 }}>{price}</div>
        {originalDiffers ? (
          <div style={{ color: '#94a3b8', textDecoration: 'line-through' }}>
            {product.priceOriginal?.value.toFixed(2)} {product.priceOriginal?.currency}
          </div>
        ) : null}
      </div>
      {product.thumbnail?.url ? (
        <div
          style={{
            maxWidth: '360px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}
        >
          <img
            src={product.thumbnail.url}
            alt={product.thumbnail.label ?? product.name}
            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
          />
        </div>
      ) : null}
      <div style={{ color: '#64748b' }}>
        <p>Opis produktu zostanie uzupełniony po integracji z Magento (placeholder).</p>
      </div>
    </section>
  );
};

export default ProductDetails;

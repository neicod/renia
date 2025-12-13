// @env: mixed
import React from 'react';
import { SlotRenderer } from 'renia-layout/components/SlotRenderer';
import type { Product } from '../../types';
import { useI18n } from 'renia-i18n/hooks/useI18n';

type Props = {
  product: Product;
};

export const ProductDetails: React.FC<Props> = ({ product }) => {
  const { t } = useI18n();
  const price = product.price
    ? `${product.price.value.toFixed(2)} ${product.price.currency}`
    : t('product.price.inCart');

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
        <p>{t('product.description.placeholder')}</p>
      </div>
      <SlotRenderer name="product-view-actions" props={{ product }} />
    </section>
  );
};

export default ProductDetails;

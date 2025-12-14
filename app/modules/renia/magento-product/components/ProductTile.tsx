// @env: mixed
import React from 'react';
import { SlotRenderer } from 'renia-layout/components/SlotRenderer';
import type { ProductInterface } from '../types';
import { useI18n } from 'renia-i18n/hooks/useI18n';

type ProductTileProps = {
  product: ProductInterface;
};

export const ProductTile: React.FC<ProductTileProps> = ({ product }) => {
  const link = `/product/${product.urlKey ?? product.sku}`;
  const { t } = useI18n();

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

        {/* Price Display */}
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
          <div style={{ color: '#94a3b8', fontWeight: 600 }}>{t('product.price.inCart')}</div>
        )}

        <SlotRenderer
          name="product-listing-actions"
          props={{
            product
          }}
        />
      </div>
    </article>
  );
};

export default ProductTile;

// @env: mixed
import React from 'react';
import { SlotRenderer } from 'renia-layout/components/SlotRenderer';
import { ProductAddToCartResolver } from 'renia-magento-cart/components/ProductAddToCartResolver';
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
        gap: '0.5rem',
        borderRadius: '8px',
        padding: '0.75rem',
        background: '#ffffff',
        border: '1px solid #e5e5e5',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        transition: 'transform 160ms ease, box-shadow 160ms ease'
      }}
    >
      {product.thumbnail?.url ? (
        <a
          href={link}
          style={{
            display: 'block',
            aspectRatio: '3 / 4',
            overflow: 'hidden',
            borderRadius: '6px',
            background: '#f5f5f5',
            border: '1px solid #f0f0f0'
          }}
        >
          <img
            src={product.thumbnail.url}
            alt={product.thumbnail.label ?? product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </a>
      ) : null}
      <div style={{ display: 'grid', gap: '0.3rem' }}>
        <a
          href={link}
          style={{
            fontWeight: 600,
            color: '#1a1a1a',
            fontSize: '0.95rem',
            lineHeight: 1.3
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
              padding: '0',
              borderRadius: '0',
              background: 'transparent',
              color: '#1a1a1a',
              fontWeight: 700,
              fontSize: '1rem',
              width: 'fit-content'
            }}
          >
            {product.price.value.toFixed(2)} {product.price.currency}
          </div>
        ) : (
          <div style={{ color: '#757575', fontWeight: 600, fontSize: '0.9rem' }}>{t('product.price.inCart')}</div>
        )}

        {/* Universal slot - Wishlist, Share, itd */}
        <SlotRenderer
          name="product-listing-actions-universal"
          props={{
            product
          }}
        />

        {/* Type-specific component - Add to Cart per product type */}
        <ProductAddToCartResolver product={product} />
      </div>
    </article>
  );
};

export default ProductTile;

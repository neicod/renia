// @env: mixed
import React from 'react';
import { ExtensionsOutlet } from '@framework/layout';
import type { ProductInterface } from '../types';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { Link } from 'react-router-dom';

type ProductTileProps = {
  product: ProductInterface;
};

export const ProductTile: React.FC<ProductTileProps> = ({ product }) => {
  const link = `/product/${product.urlKey ?? product.sku}`;
  const { t } = useI18n();
  const host = 'renia-magento-product/components/ProductTile';

  return (
    <article className="product-tile">
      <div className="product-tile__card">
        <div className="product-tile__media">
          <Link className="product-tile__mediaLink" to={link} aria-label={product.name}>
            {product.thumbnail?.url ? (
              <img
                className="product-tile__image"
                src={product.thumbnail.url}
                alt={product.thumbnail.label ?? product.name}
                loading="lazy"
              />
            ) : (
              <div className="product-tile__imagePlaceholder" />
            )}
          </Link>
        </div>

        <div className="product-tile__body">
          <Link className="product-tile__title" to={link}>
            {product.name}
          </Link>

          {/* Price Display */}
          {product.price ? (
            <div className="product-tile__price">
              {product.price.value.toFixed(2)} {product.price.currency}
            </div>
          ) : (
            <div className="product-tile__priceMuted">{t('product.price.inCart')}</div>
          )}
        </div>
      </div>

      <div className="product-tile__popover" aria-label={t('product.listing.actions')}>
        <div className="product-tile__extrasRow">
          <ExtensionsOutlet host={host} outlet="actions" props={{ product }} />
        </div>
      </div>
    </article>
  );
};

export default ProductTile;

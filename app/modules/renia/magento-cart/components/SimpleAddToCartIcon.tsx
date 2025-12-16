// @env: mixed
import React from 'react';
import type { ProductInterface } from 'magento-product/types';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { useAddToCart } from '../hooks/useAddToCart';

type Props = {
  product: ProductInterface;
};

/**
 * Simple Product Add to Cart Icon - dla listingu produktów
 * Renderuje ikonkę koszyka do szybkiego dodawania z domyślną ilością = 1
 */
export const SimpleAddToCartIcon: React.FC<Props> = ({ product }) => {
  const { t } = useI18n();
  const { adding, addToCart } = useAddToCart({ product, quantity: 1 });

  return (
    <button
      onClick={addToCart}
      disabled={adding}
      title={t('cart.action.add')}
      style={{
        background: 'none',
        border: 'none',
        cursor: adding ? 'not-allowed' : 'pointer',
        fontSize: '1.2rem',
        opacity: adding ? 0.5 : 1,
        transition: 'opacity 120ms ease',
        padding: '0.5rem'
      }}
    >
      🛒
    </button>
  );
};

export default SimpleAddToCartIcon;

// @env: mixed
import React from 'react';
import type { ProductInterface } from 'magento-product/types';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { useAddToCart } from '../hooks/useAddToCart';

type Props = {
  product: ProductInterface;
};

export const ProductAddToCartPanel: React.FC<Props> = ({ product }) => {
  const { t } = useI18n();
  const { adding, addToCart } = useAddToCart({ product, quantity: 1 });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await addToCart();
  };

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
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
    </form>
  );
};

export default ProductAddToCartPanel;

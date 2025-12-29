// @env: mixed
import React from 'react';
import type { ProductInterface } from 'renia-magento-product/types';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { useAddToCart } from '../hooks/useAddToCart';

type Props = {
  product: ProductInterface;
};

const cartButtonStyles = {
  base: {
    padding: '0.35rem',
    borderRadius: '999px',
    border: '1px solid #d1d5db',
    background: '#fff',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 120ms ease',
    width: '2.25rem',
    height: '2.25rem'
  }
} as const;

const CartIcon: React.FC<{ loading?: boolean }> = ({ loading }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M1 1h4l.92 4.58h16.08l-2.5 10H7.5m0 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm11 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"
      stroke={loading ? '#9ca3af' : '#1f2937'}
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AddToCartButton: React.FC<Props> = ({ product }) => {
  // Don't render for configurable products - they have their own handler
  if (product.__typename === 'ConfigurableProduct') {
    return null;
  }

  const { t } = useI18n();
  const { adding, addToCart } = useAddToCart({ product, quantity: 1 });

  return (
    <button
      type="button"
      aria-label={t('cart.action.add')}
      onClick={addToCart}
      disabled={adding}
      style={{
        ...cartButtonStyles.base,
        borderColor: adding ? '#e5e7eb' : '#d1d5db',
        background: adding ? 'rgba(209,213,219,0.1)' : '#fff',
        opacity: adding ? 0.6 : 1,
        cursor: adding ? 'not-allowed' : 'pointer'
      }}
      title={t('cart.action.add')}
    >
      <CartIcon loading={adding} />
    </button>
  );
};

export default AddToCartButton;

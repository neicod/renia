// @env: mixed
import React from 'react';
import type { ProductInterface } from 'magento-product/types';
import { useToast } from 'renia-ui-toast/hooks/useToast';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { useCartManager } from '../context/CartManagerContext';

type Props = {
  product: ProductInterface;
  variantSku?: string; // For configurable products - SKU of selected variant
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

export const AddToCartButton: React.FC<Props> = ({ product, variantSku }) => {
  const [adding, setAdding] = React.useState(false);
  const toast = useToast();
  const manager = useCartManager();
  const { t } = useI18n();

  // Use variant SKU if provided (for configurable products), otherwise use product SKU
  const skuToAdd = variantSku || product.sku;

  const handleAdd = React.useCallback(async () => {
    if (!product || !skuToAdd) return;
    setAdding(true);
    try {
      await manager.addProduct({ sku: skuToAdd, quantity: 1 });
      toast({
        tone: 'success',
        title: t('cart.toast.added.title'),
        description: t('cart.toast.added.single', { name: product.name ?? product.sku })
      });
    } catch (error) {
      console.error('[AddToCartButton] Failed to add product', error);
      const fallbackDesc = t('cart.toast.error.generic');
      const message = error instanceof Error ? error.message : fallbackDesc;
      toast({
        tone: 'error',
        title: t('cart.toast.error.title'),
        description: message ?? fallbackDesc
      });
    } finally {
      setAdding(false);
    }
  }, [product, skuToAdd, toast, manager, t]);

  return (
    <button
      type="button"
      aria-label={t('cart.action.add')}
      onClick={handleAdd}
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

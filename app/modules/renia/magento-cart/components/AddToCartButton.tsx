// @env: mixed
import React from 'react';
import type { Product } from 'magento-product/types';
import { useToast } from 'renia-ui-toast/hooks/useToast';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { useCartManager } from '../context/CartManagerContext';

type Props = {
  product: Product;
};

export const AddToCartButton: React.FC<Props> = ({ product }) => {
  const [adding, setAdding] = React.useState(false);
  const toast = useToast();
  const manager = useCartManager();
  const { t } = useI18n();

  const handleAdd = React.useCallback(async () => {
    if (!product || !product.sku) return;
    setAdding(true);
    try {
      await manager.addProduct({ sku: product.sku, quantity: 1 });
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
  }, [product, toast, manager, t]);

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={adding}
      style={{
        marginTop: '0.5rem',
        padding: '0.45rem 0.85rem',
        borderRadius: '999px',
        border: '1px solid #94a3b8',
        background: adding ? '#e2e8f0' : '#0f172a',
        color: '#fff',
        fontWeight: 600,
        cursor: adding ? 'not-allowed' : 'pointer',
        transition: 'opacity 120ms ease'
      }}
    >
      {adding ? t('cart.action.adding') : t('cart.action.add')}
    </button>
  );
};

export default AddToCartButton;

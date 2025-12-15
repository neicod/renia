// @env: mixed
import React from 'react';
import type { Product } from 'magento-product/types';
import { useToast } from 'renia-ui-toast/hooks/useToast';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { useCartManager } from '../context/CartManagerContext';

type Props = {
  product: Product;
};

export const ProductAddToCartPanel: React.FC<Props> = ({ product }) => {
  const [qty, setQty] = React.useState(1);
  const [adding, setAdding] = React.useState(false);
  const toast = useToast();
  const manager = useCartManager();
  const { t } = useI18n();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!qty || qty < 1) return;
    if (!product?.sku) return;
    setAdding(true);
    try {
      await manager.addProduct({ sku: product.sku, quantity: qty });
      toast({
        tone: 'success',
        title: t('cart.toast.added.title'),
        description: t('cart.toast.added.multiple', {
          qty,
          name: product.name ?? product.sku
        })
      });
    } catch (error) {
      console.error('[ProductAddToCartPanel] Failed to add product', error);
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
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {t('cart.form.quantity')}
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          style={{ padding: '0.4rem 0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5f5', width: '80px' }}
        />
      </label>
      <button
        type="submit"
        disabled={adding}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '999px',
          border: 'none',
          background: adding ? '#94a3b8' : '#2563eb',
          color: '#fff',
          fontWeight: 600,
          cursor: adding ? 'not-allowed' : 'pointer'
        }}
      >
        {adding ? t('cart.action.adding') : t('cart.action.add')}
      </button>
    </form>
  );
};

export default ProductAddToCartPanel;

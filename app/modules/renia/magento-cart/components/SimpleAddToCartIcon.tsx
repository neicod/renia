// @env: mixed
import React from 'react';
import type { ProductInterface } from 'magento-product/types';
import { useToast } from 'renia-ui-toast/hooks/useToast';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { useCartManager } from '../context/CartManagerContext';

type Props = {
  product: ProductInterface;
};

/**
 * Simple Product Add to Cart Icon - dla listingu produktów
 * Renderuje ikonkę koszyka do szybkiego dodawania z domyślną ilością = 1
 */
export const SimpleAddToCartIcon: React.FC<Props> = ({ product }) => {
  const [adding, setAdding] = React.useState(false);
  const toast = useToast();
  const manager = useCartManager();
  const { t } = useI18n();

  const handleClick = async () => {
    if (!product?.sku) return;
    setAdding(true);
    try {
      await manager.addProduct({ sku: product.sku, quantity: 1 });
      toast({
        tone: 'success',
        title: t('cart.toast.added.title'),
        description: t('cart.toast.added.single', {
          name: product.name ?? product.sku
        })
      });
    } catch (error) {
      console.error('[SimpleAddToCartIcon] Failed to add product', error);
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
    <button
      onClick={handleClick}
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

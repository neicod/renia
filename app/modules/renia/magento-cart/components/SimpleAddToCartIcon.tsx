// @env: mixed
import React from 'react';
import type { Product } from 'magento-product/types';
import { useCartManager } from '../context/CartManagerContext';
import { useToast } from 'renia-ui-toast/hooks/useToast';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { getLogger } from 'renia-logger';

const logger = getLogger();

type Props = {
  product: Product;
};

/**
 * Simple Product Add to Cart Icon - dla listingu produktów
 * Renderuje ikonkę koszyka do szybkiego dodawania
 * Dla produktów prostych dodaje z ilością 1 bez wyboru opcji
 */
export const SimpleAddToCartIcon: React.FC<Props> = ({ product }) => {
  const { t } = useI18n();
  const toast = useToast();
  const manager = useCartManager();
  const [adding, setAdding] = React.useState(false);

  const handleClick = async () => {
    setAdding(true);
    try {
      await manager.addProduct({
        sku: product.sku,
        quantity: 1
      });

      toast({
        tone: 'success',
        title: t('cart.product.addedToCart'),
        description: t('cart.product.addedDescription', {
          name: product.name,
          qty: '1'
        })
      });
    } catch (error) {
      logger.error('SimpleAddToCartIcon', 'Failed to add product to cart', {
        productSku: product.sku,
        error: error instanceof Error ? error.message : String(error)
      });
      const fallbackDesc = t('cart.product.addError');
      const message = error instanceof Error ? error.message : fallbackDesc;
      toast({
        tone: 'error',
        title: t('cart.product.error'),
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
      title={t('cart.action.addToCart')}
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

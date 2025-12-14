// @env: mixed
import React from 'react';
import type { ProductInterface } from 'magento-product/types';
import type { ConfigurableProduct } from '../types';
import { isConfigurableProduct } from '../types';
import { useConfigurableSelection } from '../hooks/useConfigurableSelection';
import { ConfigurableProductOptions } from './ConfigurableProductOptions';
import { ConfigurableProductPrice } from './ConfigurableProductPrice';
import { useCartManager } from 'renia-magento-cart/context/CartManagerContext';
import { useToast } from 'renia-ui-toast/hooks/useToast';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { getLogger } from 'renia-logger';

const logger = getLogger();

type Props = {
  product: ProductInterface;
};

export const ConfigurableAddToCartPanel: React.FC<Props> = ({ product }) => {
  const { t } = useI18n();
  const toast = useToast();
  const manager = useCartManager();

  logger.debug('ConfigurableAddToCartPanel', 'Rendering', {
    sku: product.sku,
    typename: (product as any).__typename
  });

  // Only render for configurable products
  if (!isConfigurableProduct(product)) {
    logger.debug('ConfigurableAddToCartPanel', 'Not a configurable product, returning null', {
      sku: product.sku
    });
    return null;
  }

  // After type guard, cast to ConfigurableProduct
  const configurableProduct = product as ConfigurableProduct;

  const [qty, setQty] = React.useState(1);
  const [adding, setAdding] = React.useState(false);

  const { currentVariant, ...selectionProps } = useConfigurableSelection(configurableProduct);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentVariant) {
      logger.warn('ConfigurableAddToCartPanel', 'Submit blocked - no variant selected', {
        sku: product.sku
      });
      toast({
        tone: 'warning',
        title: t('configurableProduct.cart.error.noVariant.title'),
        description: t('configurableProduct.cart.error.noVariant.description')
      });
      return;
    }

    logger.debug('ConfigurableAddToCartPanel', 'Adding to cart', {
      productSku: product.sku,
      variantSku: currentVariant.product.sku,
      quantity: qty
    });

    setAdding(true);
    try {
      await manager.addProduct({
        sku: currentVariant.product.sku,
        quantity: qty
      });

      logger.info('ConfigurableAddToCartPanel', 'Added to cart successfully', {
        productSku: product.sku,
        variantSku: currentVariant.product.sku,
        quantity: qty
      });

      toast({
        tone: 'success',
        title: t('configurableProduct.cart.success.title'),
        description: t('configurableProduct.cart.success.description', {
          name: currentVariant.product.name,
          qty: qty.toString()
        })
      });
    } catch (error) {
      logger.error('ConfigurableAddToCartPanel', 'Failed to add product to cart', {
        productSku: product.sku,
        variantSku: currentVariant.product.sku,
        quantity: qty,
        error: error instanceof Error ? error.message : String(error)
      });
      const fallbackDesc = t('configurableProduct.cart.error.generic');
      const message = error instanceof Error ? error.message : fallbackDesc;
      toast({
        tone: 'error',
        title: t('configurableProduct.cart.error.title'),
        description: message ?? fallbackDesc
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <ConfigurableProductPrice product={product} currentVariant={currentVariant} />

      <ConfigurableProductOptions product={product} {...selectionProps} />

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
              {t('configurableProduct.form.quantity')}
            </span>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))}
              style={{
                padding: '0.4rem 0.6rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5f5',
                width: '80px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </label>

          <button
            type="submit"
            disabled={adding || !currentVariant}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '999px',
              border: 'none',
              background: adding || !currentVariant ? '#94a3b8' : '#2563eb',
              color: '#fff',
              fontWeight: 600,
              cursor: adding || !currentVariant ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              transition: 'all 120ms ease'
            }}
          >
            {adding ? t('configurableProduct.action.adding') : t('configurableProduct.action.add')}
          </button>
        </div>

        {!currentVariant && (
          <div
            style={{
              color: '#92400e',
              fontSize: '0.875rem',
              padding: '0.5rem 0.75rem',
              background: '#fef3c7',
              borderRadius: '0.5rem',
              border: '1px solid #fcd34d'
            }}
          >
            {t('configurableProduct.cart.pleaseSelectOptions')}
          </div>
        )}
      </form>
    </div>
  );
};

export default ConfigurableAddToCartPanel;

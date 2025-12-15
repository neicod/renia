// @env: mixed
import React from 'react';
import type { ProductInterface } from 'magento-product/types';
import type { ConfigurableCartItemInput } from '../types';
import {
  isConfigurableProduct,
  ConfigurableProductOptions,
  useConfigurableSelection
} from 'renia-magento-configurable-product';
import { AddToCartButton } from 'renia-magento-cart/components/AddToCartButton';
import { generateSelectedOptions } from '../services/optionsEncoder';
import { useToast } from 'renia-ui-toast/hooks/useToast';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { useCartManager } from 'renia-magento-cart/context/CartManagerContext';
import { getLogger } from 'renia-logger';

const logger = getLogger();

type Props = {
  product: ProductInterface;
};

/**
 * Wrapper component for product listing actions (product tiles).
 * For configurable products: renders options + custom add-to-cart with variant SKU
 * For simple products: renders standard AddToCartButton from magento-cart
 *
 * Renders fully on both SSR and CSR - all content is visible immediately
 */
export const ConfigurableProductListingWrapper: React.FC<Props> = ({ product }) => {
  const [adding, setAdding] = React.useState(false);
  const toast = useToast();
  const manager = useCartManager();
  const { t } = useI18n();
  const { currentVariant, selectedOptions } = useConfigurableSelection(product);
  const isConfigurable = isConfigurableProduct(product);

  // Simple products: render standard AddToCartButton
  if (!isConfigurable) {
    return <AddToCartButton product={product} />;
  }

  const handleAdd = React.useCallback(async () => {
    if (!currentVariant) {
      toast({
        tone: 'error',
        title: t('configurableProduct.cart.pleaseSelectOptions'),
        description: t('configurableProduct.cart.error.noVariant.title')
      });
      return;
    }

    // Generate base64-encoded selected options for Magento GraphQL
    const isConfigurableProduct_ = isConfigurableProduct(product);
    if (!isConfigurableProduct_) {
      logger.error('ConfigurableProductListingWrapper', 'Product is not configurable');
      return;
    }

    const encodedOptions = generateSelectedOptions(
      selectedOptions,
      product.configurableOptions
    );

    setAdding(true);
    try {
      // Pass parent SKU + encoded selected options (Magento GraphQL API format)
      const cartItem: ConfigurableCartItemInput = {
        sku: product.sku,
        quantity: 1,
        selected_options: encodedOptions
      };
      await manager.addProduct(cartItem);
      toast({
        tone: 'success',
        title: t('cart.toast.added.title'),
        description: t('cart.toast.added.single', { name: product.name ?? product.sku })
      });
    } catch (error) {
      logger.error('ConfigurableProductListingWrapper', 'Failed to add product to cart', {
        error: error instanceof Error ? error.message : String(error)
      });
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
  }, [currentVariant, selectedOptions, product, toast, manager, t]);

  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        <ConfigurableProductOptions product={product} />
      </div>
      <button
        type="button"
        aria-label={t('cart.action.add')}
        onClick={handleAdd}
        disabled={adding || !currentVariant}
        style={{
          padding: '0.35rem',
          borderRadius: '999px',
          border: '1px solid #d1d5db',
          background: adding || !currentVariant ? 'rgba(209,213,219,0.1)' : '#fff',
          cursor: adding || !currentVariant ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 120ms ease',
          width: '2.25rem',
          height: '2.25rem',
          borderColor: adding ? '#e5e7eb' : '#d1d5db',
          opacity: adding ? 0.6 : 1
        }}
        title={t('cart.action.add')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M1 1h4l.92 4.58h16.08l-2.5 10H7.5m0 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm11 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"
            stroke={adding ? '#9ca3af' : '#1f2937'}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default ConfigurableProductListingWrapper;

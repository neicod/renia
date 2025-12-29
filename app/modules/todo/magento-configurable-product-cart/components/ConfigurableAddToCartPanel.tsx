// @env: mixed
import React from 'react';
import type { ProductInterface } from 'renia-magento-product/types';
import type { ConfigurableProduct } from 'renia-magento-configurable-product/types';
import type { ConfigurableCartItemInput } from '../types';
import { isConfigurableProduct } from 'renia-magento-configurable-product/types';
import { useConfigurableSelection } from 'renia-magento-configurable-product/hooks/useConfigurableSelection';
import { generateSelectedOptions } from '../services/optionsEncoder';
import { ConfigurableProductOptions } from 'renia-magento-configurable-product/components/ConfigurableProductOptions';
import { ConfigurableProductPrice } from 'renia-magento-configurable-product/components/ConfigurableProductPrice';
import { ProductAddToCartPanel } from 'renia-magento-cart/components/ProductAddToCartPanel';
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

  // For simple products, render the standard panel
  if (!isConfigurableProduct(product)) {
    return <ProductAddToCartPanel product={product} />;
  }

  // After type guard, cast to ConfigurableProduct
  const configurableProduct = product as ConfigurableProduct;

  const [adding, setAdding] = React.useState(false);
  const [showError, setShowError] = React.useState(false);

  const { currentVariant, selectedOptions, selectOption, isOptionDisabled } = useConfigurableSelection(configurableProduct);

  // Ukryj błąd gdy wariant zostanie wybrany
  React.useEffect(() => {
    if (currentVariant && showError) {
      setShowError(false);
    }
  }, [currentVariant, showError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentVariant) {
      setShowError(true);
      logger.warn('ConfigurableAddToCartPanel', 'Submit blocked - no variant selected', {
        sku: product.sku
      });
      toast({
        tone: 'info',
        title: t('configurableProduct.cart.error.noVariant.title'),
        description: t('configurableProduct.cart.error.noVariant.description')
      });
      return;
    }

    setShowError(false);

    // Generate base64-encoded selected options for Magento GraphQL
    const encodedOptions = generateSelectedOptions(
      selectedOptions,
      configurableProduct.configurableOptions
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
        title: t('configurableProduct.cart.success.title'),
        description: t('configurableProduct.cart.success.description', {
          name: currentVariant.product.name,
          qty: '1'
        })
      });
    } catch (error) {
      logger.error('ConfigurableAddToCartPanel', 'Failed to add product to cart', {
        productSku: product.sku,
        variantSku: currentVariant.product.sku,
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

      <ConfigurableProductOptions
        product={product}
        selectedOptions={selectedOptions}
        selectOption={selectOption}
        isOptionDisabled={isOptionDisabled}
        currentVariant={currentVariant}
      />

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <button
          type="submit"
          disabled={adding || !currentVariant}
          title={t('configurableProduct.action.add')}
          style={{
            background: 'none',
            border: 'none',
            cursor: adding || !currentVariant ? 'not-allowed' : 'pointer',
            fontSize: '1.2rem',
            opacity: adding || !currentVariant ? 0.5 : 1,
            transition: 'opacity 120ms ease',
            padding: '0.5rem',
            width: 'fit-content'
          }}
        >
          🛒
        </button>

        {showError && (
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

// @env: mixed
import React from 'react';
import type { ConfigurableProduct, ConfigurableVariant } from '../types';
import { useI18n } from 'renia-i18n/hooks/useI18n';

type Props = {
  product: ConfigurableProduct;
  currentVariant?: ConfigurableVariant | null;
};

export const ConfigurableProductPrice: React.FC<Props> = ({ product, currentVariant }) => {
  const { t } = useI18n();

  const displayPrice = React.useMemo(() => {
    if (currentVariant?.product.price) {
      return {
        value: currentVariant.product.price.value,
        currency: currentVariant.product.price.currency,
        isRange: false
      };
    }

    // Calculate price range from variants
    const prices = product.variants
      .map(v => v.product.price?.value)
      .filter((p): p is number => p !== undefined);

    if (prices.length === 0) {
      logger.warn('ConfigurableProductPrice', 'No prices found in variants');
      return null;
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const currency = product.variants.find(v => v.product.price)?.product.price?.currency ?? 'USD';

    // If all variants have the same price, treat as single price not range
    if (min === max) {
      return {
        value: min,
        currency,
        isRange: false
      };
    }

    return {
      min,
      max,
      currency,
      isRange: true
    };
  }, [product, currentVariant]);

  if (!displayPrice) return null;

  if ('isRange' in displayPrice && displayPrice.isRange && 'min' in displayPrice) {
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '1.25rem' }}>
          {displayPrice.min.toFixed(2)} - {displayPrice.max.toFixed(2)} {displayPrice.currency}
        </span>
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
          {t('configurableProduct.price.range')}
        </span>
      </div>
    );
  }

  if ('value' in displayPrice) {
    return (
      <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
        {displayPrice.value.toFixed(2)} {displayPrice.currency}
      </div>
    );
  }

  return null;
};

export default ConfigurableProductPrice;

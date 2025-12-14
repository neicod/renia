// @env: mixed
import React from 'react';
import type { ConfigurableVariant } from '../types';

type Props = {
  variant: ConfigurableVariant;
};

export const SelectedVariantSummary: React.FC<Props> = ({ variant }) => {
  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        background: '#f0f9ff',
        border: '1px solid #bfdbfe'
      }}
    >
      <div style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: 500 }}>
        ✓ Selected variant: {variant.attributes.map(a => a.label).join(', ')}
      </div>
      {variant.product.price && (
        <div style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.25rem' }}>
          Price: {variant.product.price.value.toFixed(2)} {variant.product.price.currency}
        </div>
      )}
      {variant.product.stockStatus === 'OUT_OF_STOCK' && (
        <div style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '0.25rem' }}>
          Out of stock
        </div>
      )}
    </div>
  );
};

export default SelectedVariantSummary;

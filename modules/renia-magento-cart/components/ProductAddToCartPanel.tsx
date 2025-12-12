// @env: mixed
import React from 'react';
import type { Product } from 'magento-product/types';
import { cartStore } from 'renia-module-cart';
import { useToast } from 'renia-ui-toast/hooks/useToast';

type Props = {
  product: Product;
};

export const ProductAddToCartPanel: React.FC<Props> = ({ product }) => {
  const [qty, setQty] = React.useState(1);
  const [adding, setAdding] = React.useState(false);
  const toast = useToast();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!qty || qty < 1) return;
    setAdding(true);
    try {
      const priceValue = product.price?.value ?? product.priceOriginal?.value ?? 0;
      cartStore.dispatch({
        type: 'add',
        item: {
          id: product.sku ?? product.id,
          sku: product.sku,
          name: product.name,
          qty,
          priceCents: Math.round(priceValue * 100),
          currency: product.price?.currency ?? product.priceOriginal?.currency ?? 'USD',
          payload: { productId: product.id }
        }
      });
      toast({
        tone: 'success',
        title: 'Dodano do koszyka',
        description: `${qty} × ${product.name}`
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        Ilość
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
        {adding ? 'Dodawanie...' : 'Dodaj do koszyka'}
      </button>
    </form>
  );
};

export default ProductAddToCartPanel;

// @env: mixed
import React from 'react';
import type { Product } from 'magento-product/types';
import { cartStore } from 'renia-module-cart';
import { useToast } from 'renia-ui-toast/hooks/useToast';

type Props = {
  product: Product;
};

const toPriceCents = (value?: number) => (value ?? 0) * 100;

export const AddToCartButton: React.FC<Props> = ({ product }) => {
  const [adding, setAdding] = React.useState(false);
  const toast = useToast();

  const handleAdd = React.useCallback(() => {
    if (!product) return;
    setAdding(true);
    try {
      const priceValue = product.price?.value ?? product.priceOriginal?.value ?? 0;
      cartStore.dispatch({
        type: 'add',
        item: {
          id: product.sku ?? product.id,
          sku: product.sku,
          name: product.name,
          qty: 1,
          priceCents: Math.round(priceValue * 100),
          currency: product.price?.currency ?? product.priceOriginal?.currency ?? 'USD',
          payload: { productId: product.id }
        }
      });
      toast({
        tone: 'success',
        title: 'Dodano do koszyka',
        description: product.name
      });
    } finally {
      setAdding(false);
    }
  }, [product, toast]);

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
      {adding ? 'Dodawanie...' : 'Dodaj do koszyka'}
    </button>
  );
};

export default AddToCartButton;

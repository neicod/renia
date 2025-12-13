// @env: mixed
import React from 'react';
import type { Product } from 'magento-product/types';
import { useToast } from 'renia-ui-toast/hooks/useToast';
import { useCartManager } from '../context/CartManagerContext';

type Props = {
  product: Product;
};

export const AddToCartButton: React.FC<Props> = ({ product }) => {
  const [adding, setAdding] = React.useState(false);
  const toast = useToast();
  const manager = useCartManager();

  const handleAdd = React.useCallback(async () => {
    if (!product || !product.sku) return;
    setAdding(true);
    try {
      await manager.addProduct({ sku: product.sku, quantity: 1 });
      toast({
        tone: 'success',
        title: 'Dodano do koszyka',
        description: product.name
      });
    } catch (error) {
      console.error('[AddToCartButton] Failed to add product', error);
      const message = error instanceof Error ? error.message : 'Spróbuj ponownie.';
      toast({
        tone: 'error',
        title: 'Nie udało się dodać produktu',
        description: message
      });
    } finally {
      setAdding(false);
    }
  }, [product, toast, manager]);

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

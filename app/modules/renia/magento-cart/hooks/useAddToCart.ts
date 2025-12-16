// @env: mixed
import { useState, useCallback } from 'react';
import type { ProductInterface } from 'magento-product/types';
import { useToast } from 'renia-ui-toast/hooks/useToast';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { useCartManager } from '../context/CartManagerContext';

export type UseAddToCartOptions = {
  product: ProductInterface;
  quantity?: number;
  onSuccess?: (product: ProductInterface) => void;
  onError?: (error: Error, product: ProductInterface) => void;
};

export type UseAddToCartReturn = {
  adding: boolean;
  addToCart: () => Promise<void>;
};

/**
 * Hook do dodawania produktów do koszyka.
 * Enkapsuluje logikę: state management, API call, toast notifications, error handling.
 *
 * @param options - Konfiguracja hooka
 * @returns { adding, addToCart } - Stan i funkcja dodawania
 *
 * @example
 * const { adding, addToCart } = useAddToCart({
 *   product,
 *   quantity: 1,
 *   onSuccess: () => console.log('Added!'),
 * });
 */
export const useAddToCart = (options: UseAddToCartOptions): UseAddToCartReturn => {
  const { product, quantity = 1, onSuccess, onError } = options;

  const [adding, setAdding] = useState(false);
  const toast = useToast();
  const manager = useCartManager();
  const { t } = useI18n();

  const addToCart = useCallback(async () => {
    if (!product?.sku) {
      console.warn('[useAddToCart] Product or SKU missing');
      return;
    }

    setAdding(true);
    try {
      await manager.addProduct({ sku: product.sku, quantity });

      toast({
        tone: 'success',
        title: t('cart.toast.added.title'),
        description: t('cart.toast.added.single', {
          name: product.name ?? product.sku
        })
      });

      onSuccess?.(product);
    } catch (error) {
      console.error('[useAddToCart] Failed to add product', error);

      const fallbackDesc = t('cart.toast.error.generic');
      const message = error instanceof Error ? error.message : fallbackDesc;

      toast({
        tone: 'error',
        title: t('cart.toast.error.title'),
        description: message ?? fallbackDesc
      });

      if (error instanceof Error) {
        onError?.(error, product);
      }
    } finally {
      setAdding(false);
    }
  }, [product, quantity, manager, toast, t, onSuccess, onError]);

  return { adding, addToCart };
};

export default useAddToCart;

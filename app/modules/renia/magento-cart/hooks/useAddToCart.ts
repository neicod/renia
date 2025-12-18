// @env: mixed
import { useState, useCallback, useMemo } from 'react';
import type { ProductInterface } from 'renia-magento-product/types';
import { useToast } from 'renia-ui-toast/hooks/useToast';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { useCartManager } from '../context/CartManagerContext';
import type {
  INotificationService,
  ILocalizationService,
  ICartService
} from '../interfaces/services';
import { useToastAdapter } from '../adapters/toastAdapter';
import { useI18nAdapter } from '../adapters/i18nAdapter';
import { useCartManagerAdapter } from '../adapters/cartManagerAdapter';

export type UseAddToCartOptions = {
  product: ProductInterface;
  quantity?: number;
  onSuccess?: (product: ProductInterface) => void;
  onError?: (error: Error, product: ProductInterface) => void;

  // NEW: Dependency Injection (opcjonalne dla testów, domyślnie używa hooków)
  notificationService?: INotificationService;
  localizationService?: ILocalizationService;
  cartService?: ICartService;
};

export type UseAddToCartReturn = {
  adding: boolean;
  addToCart: () => Promise<void>;
};

/**
 * Hook do dodawania produktów do koszyka.
 * Enkapsuluje logikę: state management, API call, toast notifications, error handling.
 *
 * Obsługuje Dependency Injection dla testowania i loose coupling:
 * - Domyślnie: używa hooków (useToast, useI18n, useCartManager)
 * - W testach: można podać mock implementacje interfejsów
 *
 * @param options - Konfiguracja hooka (+ opcjonalne DI dla testów)
 * @returns { adding, addToCart } - Stan i funkcja dodawania
 *
 * @example
 * // Użycie produkcyjne (bez DI)
 * const { adding, addToCart } = useAddToCart({
 *   product,
 *   quantity: 1,
 *   onSuccess: () => console.log('Added!'),
 * });
 *
 * @example
 * // Użycie w testach z mock'ami
 * const mockNotification: INotificationService = { success: vi.fn(), error: vi.fn() };
 * const { adding, addToCart } = useAddToCart({
 *   product,
 *   notificationService: mockNotification,
 *   localizationService: mockI18n,
 *   cartService: mockCart,
 * });
 */
export const useAddToCart = (options: UseAddToCartOptions): UseAddToCartReturn => {
  const {
    product,
    quantity = 1,
    onSuccess,
    onError,
    notificationService: injectedNotification,
    localizationService: injectedLocalization,
    cartService: injectedCart
  } = options;

  const [adding, setAdding] = useState(false);

  // Jeśli brak injected services, użyj adapters (domyślnie)
  const defaultNotification = useToastAdapter();
  const defaultLocalization = useI18nAdapter();
  const defaultCart = useCartManagerAdapter();

  // Memoizuj wybór service'u (injected lub domyślny)
  const notification = useMemo(
    () => injectedNotification ?? defaultNotification,
    [injectedNotification, defaultNotification]
  );

  const localization = useMemo(
    () => injectedLocalization ?? defaultLocalization,
    [injectedLocalization, defaultLocalization]
  );

  const cart = useMemo(
    () => injectedCart ?? defaultCart,
    [injectedCart, defaultCart]
  );

  const addToCart = useCallback(async () => {
    if (!product?.sku) {
      console.warn('[useAddToCart] Product or SKU missing');
      return;
    }

    setAdding(true);
    try {
      await cart.addProduct({ sku: product.sku, quantity });

      notification.success({
        title: localization.t('cart.toast.added.title'),
        description: localization.t('cart.toast.added.single', {
          name: product.name ?? product.sku
        })
      });

      onSuccess?.(product);
    } catch (error) {
      console.error('[useAddToCart] Failed to add product', error);

      const fallbackDesc = localization.t('cart.toast.error.generic');
      const message = error instanceof Error ? error.message : fallbackDesc;

      notification.error({
        title: localization.t('cart.toast.error.title'),
        description: message ?? fallbackDesc
      });

      if (error instanceof Error) {
        onError?.(error, product);
      }
    } finally {
      setAdding(false);
    }
  }, [product, quantity, cart, notification, localization, onSuccess, onError]);

  return { adding, addToCart };
};

export default useAddToCart;

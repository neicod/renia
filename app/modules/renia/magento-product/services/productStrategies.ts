// @env: mixed
import type { ComponentType } from 'react';

/**
 * Product Type Component Strategy
 * Mapuje slot → typ produktu → komponent
 *
 * Struktura:
 * {
 *   'add-to-cart-button': {
 *     'SimpleProduct': SimpleAddToCartIcon,
 *     'ConfigurableProduct': ConfigurableAddToCartIcon
 *   },
 *   'wishlist-button': {
 *     'SimpleProduct': SimpleWishlistButton,
 *     'ConfigurableProduct': ConfigurableWishlistButton
 *   }
 * }
 */
export type ProductTypeComponentStrategy = {
  slot: string; // 'add-to-cart-button', 'wishlist-button', etc.
  components: Record<string, ComponentType<any>>; // productType → Component
};

/**
 * Global registry - przechowuje wszystkie strategie
 * slot → (productType → Component)
 */
const productTypeStrategies: Record<string, Record<string, ComponentType<any>>> = {};

/**
 * Zarejestruj strategię dla slotu z komponentami per typ produktu
 * Merge: nadpisujemy tylko te same typy, pozostałe dodajemy
 */
export const registerProductTypeComponentStrategy = (strategy: ProductTypeComponentStrategy) => {
  if (!productTypeStrategies[strategy.slot]) {
    productTypeStrategies[strategy.slot] = {};
  }
  // Merge: nadpisujemy istniejące typy, dodajemy nowe
  productTypeStrategies[strategy.slot] = {
    ...productTypeStrategies[strategy.slot],
    ...strategy.components
  };
};

/**
 * Pobierz komponent dla typu produktu w danym slocie
 * Zwraca null jeśli brak slotu lub brak typu
 */
export const getProductTypeComponent = (
  productType: string,
  slot: string
): ComponentType<any> | null => {
  return productTypeStrategies[slot]?.[productType] ?? null;
};

/**
 * Lista wszystkich zarejestrowanych strategii (debug)
 */
export const listProductTypeStrategies = (): Record<string, Record<string, string>> => {
  const result: Record<string, Record<string, string>> = {};
  for (const [slot, typeMap] of Object.entries(productTypeStrategies)) {
    result[slot] = {};
    for (const [productType, component] of Object.entries(typeMap)) {
      result[slot][productType] = component.name || 'anonymous';
    }
  }
  return result;
};

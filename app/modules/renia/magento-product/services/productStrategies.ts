// @env: mixed
import type { ComponentType } from 'react';

/**
 * Product Type Component Strategy
 * Mapuje klucz strategii → typ produktu → komponent
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
  key: string; // 'add-to-cart-button', 'wishlist-button', etc.
  components: Record<string, ComponentType<any>>; // productType → Component
};

/**
 * Global registry - przechowuje wszystkie strategie
 * key → (productType → Component)
 */
const productTypeStrategies: Record<string, Record<string, ComponentType<any>>> = {};

/**
 * Zarejestruj strategię dla klucza z komponentami per typ produktu
 * Merge: nadpisujemy tylko te same typy, pozostałe dodajemy
 */
export const registerProductTypeComponentStrategy = (strategy: ProductTypeComponentStrategy) => {
  if (!productTypeStrategies[strategy.key]) {
    productTypeStrategies[strategy.key] = {};
  }
  // Merge: nadpisujemy istniejące typy, dodajemy nowe
  productTypeStrategies[strategy.key] = {
    ...productTypeStrategies[strategy.key],
    ...strategy.components
  };
};

/**
 * Pobierz komponent dla typu produktu w danym kluczu strategii
 * Zwraca null jeśli brak klucza lub brak typu
 */
export const getProductTypeComponent = (
  productType: string,
  key: string
): ComponentType<any> | null => {
  return productTypeStrategies[key]?.[productType] ?? null;
};

/**
 * Lista wszystkich zarejestrowanych strategii (debug)
 */
export const listProductTypeStrategies = (): Record<string, Record<string, string>> => {
  const result: Record<string, Record<string, string>> = {};
  for (const [key, typeMap] of Object.entries(productTypeStrategies)) {
    result[key] = {};
    for (const [productType, component] of Object.entries(typeMap)) {
      result[key][productType] = component.name || 'anonymous';
    }
  }
  return result;
};

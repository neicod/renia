// @env: mixed
import type { ComponentType } from 'react';

/**
 * Product strategy - komponenty dla danego typu produktu
 * Każdy slot = dedykowany komponent dla tego typu
 */
export type ProductStrategy = {
  type: string; // 'ConfigurableProduct', 'SimpleProduct', 'BundleProduct', etc.
  components: Record<string, ComponentType<any>>;
};

/**
 * Global registry - przechowuje wszystkie strategie
 */
const productStrategies: Record<string, ProductStrategy> = {};

/**
 * Zarejestruj strategię dla typu produktu
 */
export const registerProductStrategy = (strategy: ProductStrategy) => {
  if (productStrategies[strategy.type]) {
    console.warn(`ProductStrategy for "${strategy.type}" already registered, overwriting`);
  }
  productStrategies[strategy.type] = strategy;
};

/**
 * Pobierz strategię dla danego typu
 */
export const getProductStrategy = (type: string): ProductStrategy | null => {
  return productStrategies[type] ?? null;
};

/**
 * Pobierz komponent dla typu produktu i slotu
 * Zwraca null jeśli brak strategii lub brak komponentu dla slotu
 */
export const getProductStrategyComponent = (
  type: string,
  slotName: string
): ComponentType<any> | null => {
  const strategy = getProductStrategy(type);
  if (!strategy) return null;
  return strategy.components[slotName] ?? null;
};

/**
 * Lista wszystkich zarejestrowanych strategii (debug)
 */
export const listProductStrategies = (): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  for (const [type, strategy] of Object.entries(productStrategies)) {
    result[type] = Object.keys(strategy.components);
  }
  return result;
};

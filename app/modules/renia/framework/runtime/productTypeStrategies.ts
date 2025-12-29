// @env: mixed
import type { ComponentType } from 'react';

/**
 * Product Type Component Strategy
 * key -> productType -> Component
 */
export type ProductTypeComponentStrategy = {
  key: string;
  components: Record<string, ComponentType<any>>;
};

const productTypeStrategies: Record<string, Record<string, ComponentType<any>>> = {};

export const registerProductTypeComponentStrategy = (strategy: ProductTypeComponentStrategy) => {
  if (!strategy || typeof strategy !== 'object') return;
  if (!strategy.key || typeof strategy.key !== 'string') return;
  if (!strategy.components || typeof strategy.components !== 'object') return;

  if (!productTypeStrategies[strategy.key]) {
    productTypeStrategies[strategy.key] = {};
  }
  productTypeStrategies[strategy.key] = {
    ...productTypeStrategies[strategy.key],
    ...strategy.components
  };
};

export const getProductTypeComponent = (productType: string, key: string): ComponentType<any> | null => {
  return productTypeStrategies[key]?.[productType] ?? null;
};

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

export default {
  registerProductTypeComponentStrategy,
  getProductTypeComponent,
  listProductTypeStrategies
};


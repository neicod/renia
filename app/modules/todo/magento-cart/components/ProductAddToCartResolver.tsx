// @env: mixed
import React from 'react';
import { getProductTypeComponent } from 'renia-magento-product/services/productStrategies';

type Props = {
  product: any; // ProductInterface
};

/**
 * Generic resolver - wybiera komponent z registry na podstawie product.__typename
 * Renderuje TYLKO to co trzeba dla danego typu produktu
 * Brak typu = null (nie renderuj nic)
 *
 * @param product - Produkt do renderowania
 *
 * Klucz strategii ('add-to-cart-button') jest określony przez interceptor,
 * który rejestruje komponent dla danej strategii
 */
export const ProductAddToCartResolver: React.FC<Props> = ({ product }) => {
  if (!product || !product.__typename) {
    return null;
  }

  const Component = getProductTypeComponent(product.__typename, 'add-to-cart-button');

  if (!Component) {
    console.warn(`No component for product type "${product.__typename}" in strategy "add-to-cart-button"`);
    return null;
  }

  return <Component product={product} />;
};

export default ProductAddToCartResolver;

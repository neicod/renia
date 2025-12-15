// @env: mixed
import React from 'react';
import { getProductStrategyComponent } from 'magento-product/services/productStrategies';

type Props = {
  product: any; // ProductInterface
};

/**
 * Generic resolver - wybiera komponent z registry na podstawie product.__typename
 * Renderuje TYLKO to co trzeba dla danego typu produktu
 * Brak typu = null (nie renderuj nic)
 */
export const ProductAddToCartResolver: React.FC<Props> = ({ product }) => {
  if (!product || !product.__typename) {
    return null;
  }

  const Component = getProductStrategyComponent(product.__typename, 'add-to-cart');

  if (!Component) {
    console.warn(`No strategy component "add-to-cart" for product type "${product.__typename}"`);
    return null;
  }

  return <Component product={product} />;
};

export default ProductAddToCartResolver;

// @env: mixed
import React from 'react';
import { getProductStrategyComponent } from 'magento-product/services/productStrategies';

type Props = {
  product: any; // ProductInterface
  slot?: 'add-to-cart-product-page' | 'add-to-cart-product-listing';
};

/**
 * Generic resolver - wybiera komponent z registry na podstawie product.__typename
 * Renderuje TYLKO to co trzeba dla danego typu produktu
 * Brak typu = null (nie renderuj nic)
 *
 * @param product - Produkt do renderowania
 * @param slot - Typ slotu ('add-to-cart-product-page' dla strony, 'add-to-cart-product-listing' dla listingu)
 *              Domyślnie: 'add-to-cart-product-page'
 */
export const ProductAddToCartResolver: React.FC<Props> = ({
  product,
  slot = 'add-to-cart-product-page'
}) => {
  if (!product || !product.__typename) {
    return null;
  }

  const Component = getProductStrategyComponent(product.__typename, slot);

  if (!Component) {
    console.warn(`No strategy component "${slot}" for product type "${product.__typename}"`);
    return null;
  }

  return <Component product={product} />;
};

export default ProductAddToCartResolver;

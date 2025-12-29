// @env: mixed
import { SimpleAddToCartIcon } from '../components/SimpleAddToCartIcon';
import { CartControlLink } from '../components/CartControlLink';
import { CartPage } from '../pages/CartPage';
import { AddToCartButton } from '../components/AddToCartButton';
import { ProductAddToCartPanel } from '../components/ProductAddToCartPanel';
import { ProductAddToCartResolver } from '../components/ProductAddToCartResolver';

export default (api: any) => {
  // 1. Rejestruj komponenty w registry
  api.registerComponents?.({
    'renia-magento-cart/components/CartControlLink': CartControlLink,
    'renia-magento-cart/pages/CartPage': CartPage,
    'renia-magento-cart/components/AddToCartButton': AddToCartButton,
    'renia-magento-cart/components/ProductAddToCartPanel': ProductAddToCartPanel,
    'renia-magento-cart/components/ProductAddToCartResolver': ProductAddToCartResolver,
    'renia-magento-cart/components/SimpleAddToCartIcon': SimpleAddToCartIcon
  });

  // 2. Rejestruj strategie produktów dla SimpleProduct
  // Domyślnie używamy ikony (dla listingu)
  api.registerProductTypeComponentStrategy?.({
    key: 'add-to-cart-button',
    components: {
      'SimpleProduct': SimpleAddToCartIcon
    }
  });

  // 3. Rejestruj komponenty w slotach (per widok)
  api.layout.at('control-menu').add('renia-magento-cart/components/CartControlLink', 'cart-link', {
    sortOrder: { before: '-' }
  });

  // 4. ProductTile actions (listing)
  api.extend
    ?.component('renia-magento-product/components/ProductTile')
    .outlet('actions')
    .add('renia-magento-cart/components/ProductAddToCartResolver', 'add-to-cart', {
      sortOrder: { before: '-' }
    });
};

// @env: mixed
import { SimpleAddToCartIcon } from '../components/SimpleAddToCartIcon';
import { CartControlLink } from '../components/CartControlLink';
import { CartPage } from '../pages/CartPage';
import { AddToCartButton } from '../components/AddToCartButton';
import { ProductAddToCartPanel } from '../components/ProductAddToCartPanel';

export default (api: any) => {
  // 1. Rejestruj komponenty w registry
  api.registerComponents?.({
    'renia-magento-cart/components/CartControlLink': CartControlLink,
    'renia-magento-cart/pages/CartPage': CartPage,
    'renia-magento-cart/components/AddToCartButton': AddToCartButton,
    'renia-magento-cart/components/ProductAddToCartPanel': ProductAddToCartPanel,
    'renia-magento-cart/components/SimpleAddToCartIcon': SimpleAddToCartIcon
  });

  // 2. Rejestruj strategie produktów dla SimpleProduct
  // Domyślnie używamy ikony (dla listingu)
  api.registerProductTypeComponentStrategy?.({
    slot: 'add-to-cart-button',
    components: {
      'SimpleProduct': SimpleAddToCartIcon
    }
  });

  // 3. Rejestruj komponenty w slotach (per widok)
  api.layout.get('control-menu').add('renia-magento-cart/components/CartControlLink', 'cart-link', {
    sortOrder: { before: '-' }
  });
};

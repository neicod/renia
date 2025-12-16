// @env: mixed
import { ConfigurableAddToCartPanel } from '../components/ConfigurableAddToCartPanel';
import { ConfigurableAddToCartIcon } from '../components/ConfigurableAddToCartIcon';

export default (api: any) => {
  // 1. Rejestruj komponenty w registry
  api.registerComponents?.({
    'renia-magento-configurable-product-cart/components/ConfigurableAddToCartPanel': ConfigurableAddToCartPanel,
    'renia-magento-configurable-product-cart/components/ConfigurableAddToCartIcon': ConfigurableAddToCartIcon
  });

  // 2. Rejestruj strategie produktów dla ConfigurableProduct
  // Domyślnie używamy ikony (dla listingu)
  api.registerProductTypeComponentStrategy?.({
    slot: 'add-to-cart-button',
    components: {
      'ConfigurableProduct': ConfigurableAddToCartIcon
    }
  });
};

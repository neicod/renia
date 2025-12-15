// @env: mixed
import { registerProductStrategy } from 'magento-product/services/productStrategies';
import { ConfigurableAddToCartPanel } from './components/ConfigurableAddToCartPanel';
import { ConfigurableAddToCartIcon } from './components/ConfigurableAddToCartIcon';

export const registerStrategies = () => {
  registerProductStrategy({
    type: 'ConfigurableProduct',
    components: {
      'add-to-cart-product-page': ConfigurableAddToCartPanel,
      'add-to-cart-product-listing': ConfigurableAddToCartIcon
    }
  });
};

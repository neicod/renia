// @env: mixed
import { registerProductStrategy } from '@framework/layout/productStrategies';
import { ConfigurableAddToCartPanel } from './components/ConfigurableAddToCartPanel';

export const registerStrategies = () => {
  registerProductStrategy({
    type: 'ConfigurableProduct',
    components: {
      'add-to-cart': ConfigurableAddToCartPanel
    }
  });
};

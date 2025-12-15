// @env: mixed
import { registerProductStrategy } from '@framework/layout/productStrategies';
import { ProductAddToCartPanel } from './components/ProductAddToCartPanel';

export const registerStrategies = () => {
  registerProductStrategy({
    type: 'SimpleProduct',
    components: {
      'add-to-cart': ProductAddToCartPanel
    }
  });
};

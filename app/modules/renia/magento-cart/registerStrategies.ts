// @env: mixed
import { registerProductStrategy } from 'magento-product/services/productStrategies';
import { ProductAddToCartPanel } from './components/ProductAddToCartPanel';

export const registerStrategies = () => {
  registerProductStrategy({
    type: 'SimpleProduct',
    components: {
      'add-to-cart': ProductAddToCartPanel
    }
  });
};

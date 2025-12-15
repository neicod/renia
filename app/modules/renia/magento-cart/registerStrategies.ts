// @env: mixed
import { registerProductStrategy } from 'magento-product/services/productStrategies';
import { ProductAddToCartPanel } from './components/ProductAddToCartPanel';
import { SimpleAddToCartIcon } from './components/SimpleAddToCartIcon';

export const registerStrategies = () => {
  registerProductStrategy({
    type: 'SimpleProduct',
    components: {
      'add-to-cart-product-page': ProductAddToCartPanel,
      'add-to-cart-product-listing': SimpleAddToCartIcon
    }
  });
};

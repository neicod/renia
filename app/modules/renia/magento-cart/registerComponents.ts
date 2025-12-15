// @env: mixed
import { registerComponents } from '@framework/registry/componentRegistry';
import { CartControlLink } from './components/CartControlLink';
import { CartPage } from './pages/CartPage';
import { AddToCartButton } from './components/AddToCartButton';
import { ProductAddToCartPanel } from './components/ProductAddToCartPanel';
import { SimpleAddToCartIcon } from './components/SimpleAddToCartIcon';

registerComponents({
  'renia-magento-cart/components/CartControlLink': CartControlLink,
  'renia-magento-cart/pages/CartPage': CartPage,
  'renia-magento-cart/components/AddToCartButton': AddToCartButton,
  'renia-magento-cart/components/ProductAddToCartPanel': ProductAddToCartPanel,
  'renia-magento-cart/components/SimpleAddToCartIcon': SimpleAddToCartIcon
});

export default {};

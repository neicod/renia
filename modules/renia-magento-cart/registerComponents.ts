// @env: mixed
import { registerComponents } from '@framework/registry/componentRegistry';
import { CartControlLink } from './components/CartControlLink';
import { CartPage } from './pages/CartPage';

registerComponents({
  'renia-magento-cart/components/CartControlLink': CartControlLink,
  'renia-magento-cart/pages/CartPage': CartPage
});

export default {};

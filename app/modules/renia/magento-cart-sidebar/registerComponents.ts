// @env: mixed
import { registerComponents } from '@framework/registry/componentRegistry';
import { CartSidebar } from './components/CartSidebar';
import CartLinkSidebar from './components/CartLinkSidebar';

registerComponents({
  'renia-magento-cart-sidebar/components/CartSidebar': CartSidebar,
  'renia-magento-cart-sidebar/components/CartLinkSidebar': CartLinkSidebar
});

export default {};

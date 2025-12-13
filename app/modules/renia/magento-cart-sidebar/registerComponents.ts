// @env: mixed
import { registerComponents } from '@framework/registry/componentRegistry';
import { CartSidebar } from './components/CartSidebar';
import { CartSidebarToggle } from './components/CartSidebarToggle';

registerComponents({
  'renia-magento-cart-sidebar/components/CartSidebar': CartSidebar,
  'renia-magento-cart-sidebar/components/CartSidebarToggle': CartSidebarToggle
});

export default {};

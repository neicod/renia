// @env: mixed
import { CartSidebar } from '../components/CartSidebar';
import CartLinkSidebar from '../components/CartLinkSidebar';

export default function cartSidebarInterceptor(api: any = {}) {
  api.registerComponents?.({
    'renia-magento-cart-sidebar/components/CartSidebar': CartSidebar,
    'renia-magento-cart-sidebar/components/CartLinkSidebar': CartLinkSidebar
  });

  api.layout.get('global-overlay').add('renia-magento-cart-sidebar/components/CartSidebar', 'cart-sidebar', {
    sortOrder: { before: '-' }
  });

  // Podmień domyślny link koszyka, aby otwierał sidebar (poza stroną /cart)
  api.layout.get('control-menu').add('renia-magento-cart-sidebar/components/CartLinkSidebar', 'cart-link', {
    sortOrder: { before: '-' }
  });
}

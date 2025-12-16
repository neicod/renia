// @env: mixed
import { CartSidebar } from '../components/CartSidebar';
import CartLinkSidebar from '../components/CartLinkSidebar';

export default function cartSidebarInterceptor(api: any = {}) {
  api.registerComponents?.({
    'renia-magento-cart-sidebar/components/CartSidebar': CartSidebar,
    'renia-magento-cart-sidebar/components/CartLinkSidebar': CartLinkSidebar
  });

  if (api?.extension) {
    api.extension('global-overlay', {
      componentPath: 'renia-magento-cart-sidebar/components/CartSidebar',
      id: 'cart-sidebar',
      priority: 180
    });

    // Podmień domyślny link koszyka, aby otwierał sidebar (poza stroną /cart)
    api.extension('control-menu', {
      componentPath: 'renia-magento-cart-sidebar/components/CartLinkSidebar',
      id: 'cart-link',
      priority: 100
    });
  }
}

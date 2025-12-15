// @env: server
export default function cartSidebarInterceptor(api: any = {}) {
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

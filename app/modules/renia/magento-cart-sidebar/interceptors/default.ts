// @env: server
export default function cartSidebarInterceptor(api: any = {}) {
  api.slots?.add?.({
    slot: 'global-overlay',
    componentPath: 'renia-magento-cart-sidebar/components/CartSidebar',
    id: 'cart-sidebar',
    priority: 180
  });

  // Podmień domyślny link koszyka, aby otwierał sidebar (poza stroną /cart)
  api.slots?.add?.({
    slot: 'control-menu',
    componentPath: 'renia-magento-cart-sidebar/components/CartLinkSidebar',
    id: 'cart-link',
    priority: 100
  });
}

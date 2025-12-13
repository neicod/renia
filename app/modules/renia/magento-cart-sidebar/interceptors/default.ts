// @env: server
export default function cartSidebarInterceptor(api: any = {}) {
  api.slots?.add?.({
    slot: 'global-overlay',
    componentPath: 'renia-magento-cart-sidebar/components/CartSidebar',
    id: 'cart-sidebar',
    priority: 180
  });

  api.slots?.add?.({
    slot: 'control-menu',
    componentPath: 'renia-magento-cart-sidebar/components/CartSidebarToggle',
    id: 'cart-sidebar-toggle',
    priority: 95
  });
}

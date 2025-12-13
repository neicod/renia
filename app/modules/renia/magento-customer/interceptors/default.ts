// @env: server
export default function customerInterceptor(api: any = {}) {
  api.slots?.add?.({
    slot: 'control-menu',
    componentPath: 'renia-magento-customer/components/CustomerStatusControl',
    id: 'customer-status-control',
    priority: 105
  });
  api.slots?.add?.({
    slot: 'global-overlay',
    componentPath: 'renia-magento-customer/components/CustomerBootstrap',
    id: 'customer-bootstrap',
    priority: 50
  });
}

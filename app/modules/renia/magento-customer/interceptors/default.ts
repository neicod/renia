// @env: server
export default function customerInterceptor(api: any = {}) {
  if (api?.extension) {
    api.extension('control-menu', {
      componentPath: 'renia-magento-customer/components/CustomerStatusControl',
      id: 'customer-status-control',
      priority: 105
    });
    api.extension('global-overlay', {
      componentPath: 'renia-magento-customer/components/CustomerBootstrap',
      id: 'customer-bootstrap',
      priority: 50
    });
  }
}

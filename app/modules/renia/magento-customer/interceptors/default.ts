// @env: mixed
import { CustomerLoginForm } from '../components/CustomerLoginForm';
import { CustomerRegisterForm } from '../components/CustomerRegisterForm';
import { CustomerStatusControl } from '../components/CustomerStatusControl';
import { CustomerBootstrap } from '../components/CustomerBootstrap';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

export default function customerInterceptor(api: any = {}) {
  api.registerComponents?.({
    'renia-magento-customer/components/CustomerLoginForm': CustomerLoginForm,
    'renia-magento-customer/components/CustomerRegisterForm': CustomerRegisterForm,
    'renia-magento-customer/components/CustomerStatusControl': CustomerStatusControl,
    'renia-magento-customer/components/CustomerBootstrap': CustomerBootstrap,
    'renia-magento-customer/pages/LoginPage': LoginPage,
    'renia-magento-customer/pages/RegisterPage': RegisterPage
  });

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

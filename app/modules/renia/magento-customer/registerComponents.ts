// @env: mixed
import { registerComponents } from '@framework/registry/componentRegistry';
import { CustomerLoginForm } from './components/CustomerLoginForm';
import { CustomerRegisterForm } from './components/CustomerRegisterForm';
import { CustomerStatusControl } from './components/CustomerStatusControl';
import { CustomerBootstrap } from './components/CustomerBootstrap';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

registerComponents({
  'renia-magento-customer/components/CustomerLoginForm': CustomerLoginForm,
  'renia-magento-customer/components/CustomerRegisterForm': CustomerRegisterForm,
  'renia-magento-customer/components/CustomerStatusControl': CustomerStatusControl,
  'renia-magento-customer/components/CustomerBootstrap': CustomerBootstrap,
  'renia-magento-customer/pages/LoginPage': LoginPage,
  'renia-magento-customer/pages/RegisterPage': RegisterPage
});

export default {};

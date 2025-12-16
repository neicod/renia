// @env: server
import { RegisterPage } from '../pages/RegisterPage';

export default (api: any = {}) => {
  api.registerComponents?.({
    'renia-magento-customer/pages/RegisterPage': RegisterPage
  });

  if (api?.extension) {
    api.extension('content', {
      componentPath: 'renia-magento-customer/pages/RegisterPage',
      id: 'register-page',
      priority: 20
    });
  }
};

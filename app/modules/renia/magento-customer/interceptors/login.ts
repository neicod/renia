// @env: server
import { LoginPage } from '../pages/LoginPage';

export default (api: any = {}) => {
  api.registerComponents?.({
    'renia-magento-customer/pages/LoginPage': LoginPage
  });

  if (api?.extension) {
    api.extension('content', {
      componentPath: 'renia-magento-customer/pages/LoginPage',
      id: 'login-page',
      priority: 20
    });
  }
};

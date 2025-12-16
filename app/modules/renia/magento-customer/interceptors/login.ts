// @env: server
import { LoginPage } from '../pages/LoginPage';

export default (api: any = {}) => {
  api.registerComponents?.({
    'renia-magento-customer/pages/LoginPage': LoginPage
  });

  api.layout.get('content').add('renia-magento-customer/pages/LoginPage', 'login-page', {
    sortOrder: { before: '-' }
  });
};

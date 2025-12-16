// @env: server
import { RegisterPage } from '../pages/RegisterPage';

export default (api: any = {}) => {
  api.registerComponents?.({
    'renia-magento-customer/pages/RegisterPage': RegisterPage
  });

  api.layout.get('content').add('renia-magento-customer/pages/RegisterPage', 'register-page', {
    sortOrder: { before: '-' }
  });
};

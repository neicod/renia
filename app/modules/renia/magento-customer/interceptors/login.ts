// @env: mixed

export default (api: any = {}) => {
  api.layout.get('content').add('renia-magento-customer/pages/LoginPage', 'login-page', {
    sortOrder: { before: '-' }
  });
};

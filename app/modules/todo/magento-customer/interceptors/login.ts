// @env: mixed

export default (api: any = {}) => {
  api.layout.at('content').add('renia-magento-customer/pages/LoginPage', 'login-page', {
    sortOrder: { before: '-' }
  });
};

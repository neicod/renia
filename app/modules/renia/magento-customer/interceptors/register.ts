// @env: mixed

export default (api: any = {}) => {
  api.layout.get('content').add('renia-magento-customer/pages/RegisterPage', 'register-page', {
    sortOrder: { before: '-' }
  });
};

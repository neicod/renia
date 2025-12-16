// @env: mixed
export default [
  {
    path: '/login',
    componentPath: 'renia-magento-customer/pages/LoginPage',
    priority: 30,
    contexts: ['login'],
    meta: {
      layout: '@framework/layout/layouts/Layout1Column',
      type: 'auth'
    }
  },
  {
    path: '/register',
    componentPath: 'renia-magento-customer/pages/RegisterPage',
    priority: 30,
    contexts: ['register'],
    meta: {
      layout: '@framework/layout/layouts/Layout1Column',
      type: 'auth'
    }
  }
];

// @env: mixed
export default [
  {
    path: '/login',
    componentPath: 'renia-magento-customer/pages/LoginPage',
    priority: 30,
    contexts: ['login'],
    meta: {
      layout: 'renia-layout/layouts/1column',
      type: 'auth'
    }
  },
  {
    path: '/register',
    componentPath: 'renia-magento-customer/pages/RegisterPage',
    priority: 30,
    contexts: ['register'],
    meta: {
      layout: 'renia-layout/layouts/1column',
      type: 'auth'
    }
  }
];

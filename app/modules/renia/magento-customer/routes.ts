// @env: mixed
export default [
  {
    path: '/login',
    componentPath: 'renia-magento-customer/pages/LoginPage',
    priority: 30,
    layout: '1column',
    contexts: ['login'],
    meta: { type: 'auth' }
  },
  {
    path: '/register',
    componentPath: 'renia-magento-customer/pages/RegisterPage',
    priority: 30,
    layout: '1column',
    contexts: ['register'],
    meta: { type: 'auth' }
  }
];

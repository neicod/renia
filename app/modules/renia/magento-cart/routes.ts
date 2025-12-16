// @env: mixed
export default [
  {
    path: '/cart',
    componentPath: 'renia-magento-cart/pages/CartPage',
    priority: 100,
    contexts: ['cart'],
    meta: {
      layout: '@framework/layout/layouts/Layout1Column'
    }
  }
];

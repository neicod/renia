// @env: mixed
export default [
  {
    path: '/product/:urlKey',
    componentPath: 'renia-magento-product/pages/ProductPage',
    handler: 'renia-magento-product/routeHandler',
    priority: 40,
    contexts: ['product'],
    meta: {
      layout: '@framework/layout/layouts/Layout2ColumnsLeft'
    }
  }
];

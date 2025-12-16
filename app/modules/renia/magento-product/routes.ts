// @env: mixed
export default [
  {
    path: '/product/:urlKey',
    componentPath: 'magento-product/pages/ProductPage',
    handler: 'magento-product/routeHandler',
    priority: 40,
    contexts: ['product'],
    meta: {
      layout: '@framework/layout/layouts/Layout2ColumnsLeft'
    }
  }
];

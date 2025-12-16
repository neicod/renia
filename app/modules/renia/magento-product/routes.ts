// @env: mixed
export default [
  {
    path: '/product/:urlKey',
    componentPath: 'magento-product/pages/ProductPage',
    handler: 'magento-product/routeHandler',
    priority: 40,
    contexts: ['product'],
    meta: {
      layout: 'renia-layout/layouts/2columns-left'
    }
  }
];

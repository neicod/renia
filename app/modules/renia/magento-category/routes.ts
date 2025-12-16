// @env: mixed
export default [
  {
    path: '/category/*',
    componentPath: 'renia-layout/pages/LayoutPage',
    handler: 'renia-magento-category/routeHandler',
    priority: 50,
    contexts: ['category'],
    meta: {
      layout: 'renia-layout/layouts/2columns-left',
      type: 'category',
      passUrlPath: true
    }
  }
];

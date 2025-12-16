// @env: mixed
export default [
  {
    path: '/category/*',
    componentPath: 'renia-layout/pages/LayoutPage',
    handler: 'renia-magento-category/routeHandler',
    priority: 50,
    layout: '1column',
    contexts: ['category'],
    meta: {
      type: 'category',
      passUrlPath: true
    }
  }
];

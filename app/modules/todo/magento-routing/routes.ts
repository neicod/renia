// @env: mixed
export default [
  {
    path: '/*',
    componentPath: '@renia/framework/layout/pages/LayoutPage',
    handler: 'renia-magento-routing/routeHandler',
    priority: 1,
    contexts: [],
    meta: {
      // Default; handler will override based on resolved route type.
      layout: '@renia/framework/layout/layouts/Layout1Column',
      type: 'magento-route'
    }
  }
];


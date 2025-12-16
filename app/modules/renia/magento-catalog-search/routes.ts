// @env: mixed
export default [
  {
    path: '/search',
    componentPath: '@framework/layout/pages/LayoutPage',
    handler: 'renia-magento-catalog-search/routeHandler',
    priority: 45,
    contexts: ['search'],
    meta: {
      layout: '@framework/layout/layouts/Layout2ColumnsLeft',
      type: 'search'
    }
  }
];

// @env: mixed
export default [
  {
    path: '/search',
    componentPath: '@renia/framework/layout/pages/LayoutPage',
    handler: 'renia-magento-catalog-search/routeHandler',
    priority: 45,
    contexts: ['search'],
    meta: {
      layout: '@renia/framework/layout/layouts/Layout2ColumnsLeft',
      type: 'search'
    }
  }
];

// @env: mixed
export default [
  {
    path: '/search',
    componentPath: 'renia-layout/pages/LayoutPage',
    handler: 'renia-magento-catalog-search/routeHandler',
    priority: 45,
    contexts: ['search'],
    meta: {
      layout: 'renia-layout/layouts/2columns-left',
      type: 'search'
    }
  }
];

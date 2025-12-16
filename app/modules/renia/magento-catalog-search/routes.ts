// @env: mixed
export default [
  {
    path: '/search',
    componentPath: 'renia-layout/pages/LayoutPage',
    handler: 'renia-magento-catalog-search/routeHandler',
    priority: 45,
    layout: '1column',
    contexts: ['search'],
    meta: {
      type: 'search'
    }
  }
];

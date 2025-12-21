// @env: mixed
export default [
  {
    path: '/cart',
    componentPath: '@framework/layout/pages/LayoutPage',
    priority: 100,
    contexts: ['cart'],
    meta: {
      layout: '@framework/layout/layouts/Layout1Column'
    }
  }
];

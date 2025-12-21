// @env: mixed
export default [
  {
    path: '/login',
    componentPath: '@framework/layout/pages/LayoutPage',
    priority: 30,
    contexts: ['login'],
    meta: {
      layout: '@framework/layout/layouts/Layout1Column',
      type: 'auth'
    }
  },
  {
    path: '/register',
    componentPath: '@framework/layout/pages/LayoutPage',
    priority: 30,
    contexts: ['register'],
    meta: {
      layout: '@framework/layout/layouts/Layout1Column',
      type: 'auth'
    }
  }
];

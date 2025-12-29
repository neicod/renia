// @env: mixed
export default [
  {
    path: '/login',
    componentPath: '@renia/framework/layout/pages/LayoutPage',
    priority: 30,
    contexts: ['login'],
    meta: {
      layout: '@renia/framework/layout/layouts/Layout1Column',
      type: 'auth'
    }
  },
  {
    path: '/register',
    componentPath: '@renia/framework/layout/pages/LayoutPage',
    priority: 30,
    contexts: ['register'],
    meta: {
      layout: '@renia/framework/layout/layouts/Layout1Column',
      type: 'auth'
    }
  }
];

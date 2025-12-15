// @env: server
// Wstrzykujemy globalny provider i18n przez slot global-overlay
export default function i18nInterceptor(api: any = {}) {
  if (api?.extension) {
    api.extension('global-overlay', {
      componentPath: 'renia-i18n/components/I18nBootstrap',
      id: 'i18n-bootstrap',
      priority: 5
    });
  }
}

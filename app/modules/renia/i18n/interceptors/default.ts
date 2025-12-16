// @env: mixed
import I18nBootstrap from '../components/I18nBootstrap';

// Wstrzykujemy globalny provider i18n przez slot global-overlay
export default function i18nInterceptor(api: any = {}) {
  api.registerComponents?.({
    'renia-i18n/components/I18nBootstrap': I18nBootstrap
  });

  if (api?.extension) {
    api.extension('global-overlay', {
      componentPath: 'renia-i18n/components/I18nBootstrap',
      id: 'i18n-bootstrap',
      priority: 5
    });
  }
}

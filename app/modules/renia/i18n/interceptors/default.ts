// @env: mixed
import I18nBootstrap from '../components/I18nBootstrap';

// Wstrzykujemy globalny provider i18n przez slot global-overlay
export default function i18nInterceptor(api: any = {}) {
  api.registerComponents?.({
    'renia-i18n/components/I18nBootstrap': I18nBootstrap
  });

  api.layout.get('global-overlay').add('renia-i18n/components/I18nBootstrap', 'i18n-bootstrap', {
    sortOrder: { before: '-' }
  });
}

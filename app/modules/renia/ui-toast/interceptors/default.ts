// @env: mixed
import { ToastViewport } from '../components/ToastViewport';

export default function toastInterceptor(api: any = {}) {
  api.registerComponents?.({
    'renia-ui-toast/components/ToastViewport': ToastViewport
  });

  api.layout.get('global-overlay').add('renia-ui-toast/components/ToastViewport', 'toast-viewport', {
    sortOrder: { before: '-' }
  });
}

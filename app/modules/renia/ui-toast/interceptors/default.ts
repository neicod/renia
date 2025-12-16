// @env: mixed
import { ToastViewport } from '../components/ToastViewport';

export default function toastInterceptor(api: any = {}) {
  api.registerComponents?.({
    'renia-ui-toast/components/ToastViewport': ToastViewport
  });

  if (api?.extension) {
    api.extension('global-overlay', {
      componentPath: 'renia-ui-toast/components/ToastViewport',
      id: 'toast-viewport',
      priority: 200
    });
  }
}

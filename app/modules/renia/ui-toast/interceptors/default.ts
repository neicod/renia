// @env: server
export default function toastInterceptor(api: any = {}) {
  if (api?.extension) {
    api.extension('global-overlay', {
      componentPath: 'renia-ui-toast/components/ToastViewport',
      id: 'toast-viewport',
      priority: 200
    });
  }
}

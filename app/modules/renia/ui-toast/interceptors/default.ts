// @env: server
export default function toastInterceptor(api: any = {}) {
  if (api?.slots?.add) {
    api.slots.add({
      slot: 'global-overlay',
      componentPath: 'renia-ui-toast/components/ToastViewport',
      id: 'toast-viewport',
      priority: 200
    });
  }
}

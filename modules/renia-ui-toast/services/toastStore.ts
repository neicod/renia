// @env: mixed
export type ToastTone = 'success' | 'error' | 'info';

export type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
};

type Subscriber = (state: ToastItem[]) => void;

const DEFAULT_DURATION = 3500;

const listeners = new Set<Subscriber>();
let state: ToastItem[] = [];

const notify = () => {
  const snapshot = state;
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('[toastStore] listener error', error);
    }
  });
};

const removeAfter = (id: string, duration?: number) => {
  if (!duration) return;
  setTimeout(() => {
    dismissToast(id);
  }, duration);
};

const randomId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export const pushToast = (toast: Omit<ToastItem, 'id'> & { id?: string }) => {
  const item: ToastItem = {
    id: toast.id ?? randomId(),
    tone: toast.tone ?? 'info',
    duration: toast.duration ?? DEFAULT_DURATION,
    title: toast.title,
    description: toast.description
  };
  state = [...state, item];
  notify();
  removeAfter(item.id, item.duration);
  return item.id;
};

export const dismissToast = (id: string) => {
  const next = state.filter((toast) => toast.id !== id);
  if (next.length === state.length) return;
  state = next;
  notify();
};

export const toastStore = {
  getState: () => state,
  subscribe: (listener: Subscriber) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

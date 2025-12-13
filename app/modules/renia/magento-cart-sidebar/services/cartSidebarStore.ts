// @env: mixed
export type CartSidebarState = {
  isOpen: boolean;
};

type Subscriber = (state: CartSidebarState) => void;

let state: CartSidebarState = { isOpen: false };
const listeners = new Set<Subscriber>();

const notify = () => {
  const snapshot = state;
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('[cartSidebarStore] listener error', error);
    }
  });
};

export const cartSidebarStore = {
  getState: () => state,
  subscribe: (listener: Subscriber) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  open: () => {
    if (!state.isOpen) {
      state = { isOpen: true };
      notify();
      return true;
    }
    return false;
  },
  close: () => {
    if (state.isOpen) {
      state = { isOpen: false };
      notify();
      return true;
    }
    return false;
  },
  toggle: () => {
    state = { isOpen: !state.isOpen };
    notify();
    return state.isOpen;
  }
};

export const openCartSidebar = () => cartSidebarStore.open();
export const closeCartSidebar = () => cartSidebarStore.close();
export const toggleCartSidebar = () => cartSidebarStore.toggle();

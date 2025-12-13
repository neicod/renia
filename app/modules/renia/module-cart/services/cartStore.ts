// @env: mixed
import browserStorage from '@framework/storage/browserStorage';

export type CartItem = {
  id: string;
  sku?: string;
  name: string;
  qty: number;
  priceCents: number;
  currency?: string;
  payload?: Record<string, unknown>;
};

export type CartState = {
  items: CartItem[];
  updatedAt: number;
};

export type CartAction =
  | { type: 'add'; item: CartItem }
  | { type: 'update'; id: string; qty: number }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
  | { type: 'set'; items: CartItem[] };

export type CartStore = {
  getState: () => CartState;
  subscribe: (listener: (state: CartState) => void) => () => void;
  dispatch: (action: CartAction) => void;
};

const STORAGE_KEY = 'renia.cart';
const STORAGE_SUMMARY_KEY = 'renia.cart.summary';
const STORAGE_TTL_MS = 60 * 60 * 1000; // 1 godzina

const isBrowser = typeof window !== 'undefined';

const getEmptyState = (): CartState => ({ items: [], updatedAt: Date.now() });

const removePersistedState = () => {
  if (!isBrowser) return;
  browserStorage.removeItem(STORAGE_KEY);
  browserStorage.removeItem(STORAGE_SUMMARY_KEY);
};

const serialize = (state: CartState) => {
  try {
    return JSON.stringify(state);
  } catch {
    return null;
  }
};

const deserialize = (raw: string | null): CartState | null => {
  try {
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return {
      items: parsed.items.map((item: any) => ({
        id: String(item.id),
        sku: item.sku ? String(item.sku) : undefined,
        name: String(item.name ?? ''),
        qty: Number(item.qty) || 0,
        priceCents: Number(item.priceCents) || 0,
        currency: item.currency ? String(item.currency) : undefined,
        payload: item.payload && typeof item.payload === 'object' ? item.payload : undefined
      })),
      updatedAt: Number(parsed.updatedAt) || Date.now()
    };
  } catch {
    return null;
  }
};

const loadInitialState = (): CartState => {
  if (!isBrowser) {
    return getEmptyState();
  }
  const raw = browserStorage.getItem(STORAGE_KEY);
  const parsed = deserialize(raw);
  if (!parsed) {
    return getEmptyState();
  }
  if (Date.now() - parsed.updatedAt > STORAGE_TTL_MS) {
    removePersistedState();
    return getEmptyState();
  }
  return parsed;
};

const persistSummary = (state: CartState) => {
  if (!isBrowser) return;
  const qty = state.items.reduce((sum, item) => sum + Math.max(0, item.qty || 0), 0);
  const payload = JSON.stringify({ qty, updatedAt: state.updatedAt });
  browserStorage.setItem(STORAGE_SUMMARY_KEY, payload);
};

const persistState = (state: CartState) => {
  if (!isBrowser) return;
  const raw = serialize(state);
  if (!raw) return;
  browserStorage.setItem(STORAGE_KEY, raw);
  persistSummary(state);
};

const reduce = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'add': {
      const existingIndex = state.items.findIndex((item) => item.id === action.item.id);
      const items = [...state.items];
      if (existingIndex >= 0) {
        const current = items[existingIndex];
        items[existingIndex] = {
          ...current,
          qty: current.qty + action.item.qty
        };
      } else {
        items.push(action.item);
      }
      return { items, updatedAt: Date.now() };
    }
    case 'update': {
      const items = state.items.map((item) =>
        item.id === action.id ? { ...item, qty: Math.max(0, action.qty) } : item
      );
      return { items, updatedAt: Date.now() };
    }
    case 'remove': {
      const items = state.items.filter((item) => item.id !== action.id);
      return { items, updatedAt: Date.now() };
    }
    case 'set': {
      return { items: action.items.slice(), updatedAt: Date.now() };
    }
    case 'clear':
      return { items: [], updatedAt: Date.now() };
    default:
      return state;
  }
};

const createStore = (): CartStore => {
  let state = loadInitialState();
  const listeners = new Set<(state: CartState) => void>();

  const setState = (next: CartState) => {
    state = next;
    persistState(state);
    notifySummaryListeners();
    listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('[cartStore] listener error', error);
      }
    });
  };

  const dispatch = (action: CartAction) => {
    setState(reduce(state, action));
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispatch
  };
};

const getGlobalStore = (): CartStore => {
  const globalObj = globalThis as typeof globalThis & { __RENIA_CART_STORE__?: CartStore };
  if (!globalObj.__RENIA_CART_STORE__) {
    globalObj.__RENIA_CART_STORE__ = createStore();
  }
  return globalObj.__RENIA_CART_STORE__;
};

export const cartStore = getGlobalStore();

export const addItemToCart = (item: CartItem) => {
  cartStore.dispatch({ type: 'add', item });
};

export const updateCartItemQty = (id: string, qty: number) => {
  cartStore.dispatch({ type: 'update', id, qty });
};

export const removeCartItem = (id: string) => {
  cartStore.dispatch({ type: 'remove', id });
};

export const clearCart = () => cartStore.dispatch({ type: 'clear' });
export const setCartItems = (items: CartItem[]) => cartStore.dispatch({ type: 'set', items });

export type CartQuantitySummary = {
  qty: number;
  updatedAt: number;
};

const parseSummary = (raw: string | null): CartQuantitySummary | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.qty !== 'number' || typeof parsed?.updatedAt !== 'number') {
      return null;
    }
    return { qty: Math.max(0, parsed.qty), updatedAt: parsed.updatedAt };
  } catch {
    return null;
  }
};

export const readCartQuantitySummary = (): CartQuantitySummary | null => {
  if (!isBrowser) return null;
  const raw = browserStorage.getItem(STORAGE_SUMMARY_KEY);
  const summary = parseSummary(raw);
  if (!summary) {
    return null;
  }
  if (Date.now() - summary.updatedAt > STORAGE_TTL_MS) {
    removePersistedState();
    return null;
  }
  return summary;
};

const summaryListeners = new Set<(summary: CartQuantitySummary | null) => void>();

export const subscribeToCartQuantity = (listener: (summary: CartQuantitySummary | null) => void) => {
  summaryListeners.add(listener);
  return () => summaryListeners.delete(listener);
};

const notifySummaryListeners = () => {
  const summary = readCartQuantitySummary();
  summaryListeners.forEach((listener) => {
    try {
      listener(summary);
    } catch (error) {
      console.error('[cartStore] summary listener error', error);
    }
  });
};

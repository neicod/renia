// @env: mixed
export type CustomerInfo = {
  email: string;
  firstname?: string | null;
  lastname?: string | null;
};

export type CustomerState = {
  status: 'anonymous' | 'loading' | 'authenticated';
  customer: CustomerInfo | null;
  token: string | null;
  error?: string | null;
};

type Subscriber = (state: CustomerState) => void;

const initialState: CustomerState = {
  status: 'anonymous',
  customer: null,
  token: null,
  error: null
};

let state: CustomerState = initialState;
const listeners = new Set<Subscriber>();

const notify = () => {
  const snapshot = state;
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('[customerStore] listener error', error);
    }
  });
};

const setState = (next: CustomerState) => {
  state = next;
  notify();
};

export const customerStore = {
  getState: () => state,
  subscribe: (listener: Subscriber) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setLoading: (token: string | null) =>
    setState({
      ...state,
      status: 'loading',
      token,
      error: null
    }),
  setAuthenticated: (customer: CustomerInfo, token: string) =>
    setState({
      status: 'authenticated',
      customer,
      token,
      error: null
    }),
  setAnonymous: () => setState({ ...initialState }),
  setError: (message: string | null) =>
    setState({
      ...state,
      error: message
    })
};

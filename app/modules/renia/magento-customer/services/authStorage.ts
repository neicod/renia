// @env: mixed
const TOKEN_KEY = 'renia.magento.customerToken';

let memoryToken: string | null = null;
const isBrowser = typeof window !== 'undefined';

export const getStoredCustomerToken = (): string | null => {
  if (isBrowser) {
    try {
      return window.localStorage?.getItem(TOKEN_KEY) ?? null;
    } catch {
      return null;
    }
  }
  return memoryToken;
};

export const storeCustomerToken = (token: string) => {
  if (isBrowser) {
    try {
      window.localStorage?.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
  } else {
    memoryToken = token;
  }
};

export const clearCustomerToken = () => {
  if (isBrowser) {
    try {
      window.localStorage?.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  }
  memoryToken = null;
};

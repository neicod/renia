// @env: mixed

import deepEqual from 'fast-deep-equal';
import { formatMessage } from './interpolate.js';
import type { Messages } from './types.js';

export type I18nState = {
  lang: string;
  messages: Messages;
};

type Listener = (state: I18nState) => void;

const defaultState: I18nState = { lang: 'en_US', messages: {} };

export class I18nStore {
  private state: I18nState;
  private listeners = new Set<Listener>();

  constructor(initial?: Partial<I18nState>) {
    this.state = { ...defaultState, ...(initial ?? {}) };
  }

  getState() {
    return this.state;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setTranslations(lang: string, messages: Messages) {
    const next: I18nState = { lang, messages };
    if (deepEqual(this.state, next)) return;
    this.state = next;
    this.listeners.forEach((l) => l(this.state));
  }

  t(key: string, params?: any): string {
    const msg = this.state.messages[key] ?? key;
    return formatMessage(msg, params);
  }
}

// singleton domyślny
const globalObj = globalThis as any;
if (!globalObj.__RENIA_I18N_STORE__) {
  globalObj.__RENIA_I18N_STORE__ = new I18nStore();
}
export const i18nStore: I18nStore = globalObj.__RENIA_I18N_STORE__;

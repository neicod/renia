// @env: mixed
import React from 'react';
import { i18nStore, I18nStore } from '../services/i18nStore';
import type { Messages } from '../services/types';

export type I18nProviderProps = {
  lang?: string;
  messages?: Messages;
  children?: React.ReactNode;
  store?: I18nStore;
};

type I18nContextValue = {
  lang: string;
  t: (key: string, params?: any) => string;
  setLang: (lang: string, messages?: Messages) => void;
};

export const I18nContext = React.createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<I18nProviderProps> = ({
  lang,
  messages,
  children,
  store = i18nStore
}) => {
  React.useEffect(() => {
    if (lang && messages) {
      store.setTranslations(lang, messages);
    }
  }, [lang, messages, store]);

  const [state, setState] = React.useState(store.getState());

  React.useEffect(() => store.subscribe(setState), [store]);

  const value = React.useMemo<I18nContextValue>(
    () => ({
      lang: state.lang,
      t: (key, params) => store.t(key, params),
      setLang: (nextLang: string, nextMessages?: Messages) => {
        if (nextMessages) {
          store.setTranslations(nextLang, nextMessages);
        } else {
          store.setTranslations(nextLang, state.messages);
        }
      }
    }),
    [state, store]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export default I18nProvider;

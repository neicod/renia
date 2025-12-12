// @env: mixed
import React from 'react';
import type { StoreConfig } from 'renia-magento-store';

export type AppRuntime = 'ssr' | 'client';

export type AppEnvironment = {
  runtime: AppRuntime;
  storeCode?: string | null;
  store?: StoreConfig | null;
};

const defaultEnvironment: AppEnvironment = {
  runtime: 'client',
  storeCode: undefined,
  store: null
};

const AppEnvironmentContext = React.createContext<AppEnvironment>(defaultEnvironment);

type ProviderProps = AppEnvironment & {
  children: React.ReactNode;
};

export const AppEnvironmentProvider: React.FC<ProviderProps> = ({
  runtime,
  storeCode,
  store,
  children
}) => (
  <AppEnvironmentContext.Provider value={{ runtime, storeCode, store }}>
    {children}
  </AppEnvironmentContext.Provider>
);

export const useAppEnvironment = (): AppEnvironment => React.useContext(AppEnvironmentContext);

export default {
  AppEnvironmentProvider,
  useAppEnvironment
};

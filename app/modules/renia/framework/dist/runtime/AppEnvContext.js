import { jsx as _jsx } from "react/jsx-runtime";
// @env: mixed
import React from 'react';
const defaultEnvironment = {
    runtime: 'client',
    storeCode: undefined,
    store: null
};
const AppEnvironmentContext = React.createContext(defaultEnvironment);
export const AppEnvironmentProvider = ({ runtime, storeCode, store, children }) => (_jsx(AppEnvironmentContext.Provider, { value: { runtime, storeCode, store }, children: children }));
export const useAppEnvironment = () => React.useContext(AppEnvironmentContext);
export default {
    AppEnvironmentProvider,
    useAppEnvironment
};

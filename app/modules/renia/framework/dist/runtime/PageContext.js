import { jsx as _jsx } from "react/jsx-runtime";
// @env: mixed
import React from 'react';
const defaultContext = {
    store: { id: null, code: null },
    kind: 'default',
    extensions: {}
};
const PageContextReact = React.createContext(defaultContext);
export const PageContextProvider = ({ value, children }) => (_jsx(PageContextReact.Provider, { value: value ?? defaultContext, children: children }));
export const usePageContext = () => React.useContext(PageContextReact);
export default {
    PageContextProvider,
    usePageContext
};

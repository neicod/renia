import { jsx as _jsx } from "react/jsx-runtime";
// @env: mixed
import React from 'react';
import { useLocation } from 'react-router-dom';
const RenderedLocationContext = React.createContext(null);
export const RenderedLocationProvider = ({ location, children }) => {
    return (_jsx(RenderedLocationContext.Provider, { value: location, children: children }));
};
/**
 * Returns the location currently rendered by the app shell.
 *
 * Why:
 * - During SPA navigation we may keep rendering the previous route/layout while `/api/page-context` is inflight.
 * - React Router's `useLocation()` reflects the browser URL immediately, which can trigger premature resets/fetches.
 * - AppRoot provides the "rendered location" via RenderedLocationProvider.
 */
export const useRenderedLocation = () => {
    const actual = useLocation();
    const rendered = React.useContext(RenderedLocationContext);
    return rendered ?? actual;
};
export default {
    RenderedLocationProvider,
    useRenderedLocation
};

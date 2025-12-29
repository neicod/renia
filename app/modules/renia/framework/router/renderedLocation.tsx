// @env: mixed
import React from 'react';
import type { Location } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const RenderedLocationContext = React.createContext<Location | null>(null);

export const RenderedLocationProvider: React.FC<{
  location: Location;
  children: React.ReactNode;
}> = ({ location, children }) => {
  return (
    <RenderedLocationContext.Provider value={location}>
      {children}
    </RenderedLocationContext.Provider>
  );
};

/**
 * Returns the location currently rendered by the app shell.
 *
 * Why:
 * - During SPA navigation we may keep rendering the previous route/layout while `/api/page-context` is inflight.
 * - React Router's `useLocation()` reflects the browser URL immediately, which can trigger premature resets/fetches.
 * - AppRoot provides the "rendered location" via RenderedLocationProvider.
 */
export const useRenderedLocation = (): Location => {
  const actual = useLocation();
  const rendered = React.useContext(RenderedLocationContext);
  return rendered ?? actual;
};

export default {
  RenderedLocationProvider,
  useRenderedLocation
};


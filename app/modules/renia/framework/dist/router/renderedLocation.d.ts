import React from 'react';
import type { Location } from 'react-router-dom';
export declare const RenderedLocationProvider: React.FC<{
    location: Location;
    children: React.ReactNode;
}>;
/**
 * Returns the location currently rendered by the app shell.
 *
 * Why:
 * - During SPA navigation we may keep rendering the previous route/layout while `/api/page-context` is inflight.
 * - React Router's `useLocation()` reflects the browser URL immediately, which can trigger premature resets/fetches.
 * - AppRoot provides the "rendered location" via RenderedLocationProvider.
 */
export declare const useRenderedLocation: () => Location;
declare const _default: {
    RenderedLocationProvider: React.FC<{
        location: Location;
        children: React.ReactNode;
    }>;
    useRenderedLocation: () => Location;
};
export default _default;
//# sourceMappingURL=renderedLocation.d.ts.map
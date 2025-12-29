import React from 'react';
import type { RegionsSnapshot } from './buildRegions';
type Props = {
    layout: string;
    main: React.ReactNode;
    resolveComponent: (entry: {
        component?: string;
        componentPath?: string;
    }) => React.ComponentType<any>;
    regions: RegionsSnapshot;
    extensions?: any;
    routeMeta?: any;
};
export declare const LayoutShell: React.FC<Props>;
export default LayoutShell;
//# sourceMappingURL=LayoutShell.d.ts.map
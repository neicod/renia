import React from 'react';
import type { ExtensionsSnapshot } from './ExtensionsRegistry';
type ExtensionsContextValue = {
    extensions?: ExtensionsSnapshot;
    resolveComponent: (entry: {
        component?: string;
        componentPath?: string;
    }) => React.ComponentType<any>;
    routeMeta?: Record<string, unknown>;
};
export declare const ExtensionsContext: React.Context<ExtensionsContextValue | null>;
export declare const ExtensionsProvider: React.FC<React.PropsWithChildren<{
    extensions?: ExtensionsSnapshot;
    resolveComponent: ExtensionsContextValue['resolveComponent'];
    routeMeta?: Record<string, unknown>;
}>>;
type Props = {
    host: string;
    outlet: string;
    props?: Record<string, unknown>;
    meta?: Record<string, unknown>;
};
export declare const ExtensionsOutlet: React.FC<Props>;
export default ExtensionsOutlet;
//# sourceMappingURL=ExtensionsOutlet.d.ts.map
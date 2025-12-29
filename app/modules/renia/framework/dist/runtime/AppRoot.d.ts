import React from 'react';
import { type AppRuntime } from './AppEnvContext';
import { type PageContext } from './PageContext';
import { type RegionsSnapshot, type ExtensionsSnapshot } from '@renia/framework/layout';
import { type RouteMeta } from '@renia/framework/router/routeMeta';
type RouteEntry = {
    path: string;
    component?: string;
    componentPath?: string;
    layout?: string;
    contexts?: string[];
    meta?: RouteMeta;
};
type BootstrapData = {
    routes: RouteEntry[];
    regions: RegionsSnapshot;
    extensions?: ExtensionsSnapshot;
    pageContext?: PageContext;
    contexts?: string[];
    enabledModules?: string[];
    config?: Record<string, unknown> & {
        i18n?: {
            lang?: string;
            messages?: Record<string, string>;
        };
    };
};
type AppRootProps = {
    bootstrap: BootstrapData;
    runtime?: AppRuntime;
};
export declare const AppRoot: React.FC<AppRootProps>;
export default AppRoot;
//# sourceMappingURL=AppRoot.d.ts.map
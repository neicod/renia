import type React from 'react';
import * as server from '@renia/framework/registry/componentRegistryServer';
import * as client from '@renia/framework/registry/componentRegistryClient';
type ComponentType = React.ComponentType<any>;
type Registry = {
    registerComponent: (name: string, component: ComponentType) => void;
    registerComponents: (entries: Record<string, ComponentType>) => void;
    getComponent: (name: string) => ComponentType | undefined;
    resolveComponentEntry: (entry: {
        component?: string;
        componentPath?: string;
    }, fallback?: ComponentType) => ComponentType;
    listRegisteredComponents: () => string[];
};
export declare const registerComponent: Registry['registerComponent'];
export declare const registerComponents: Registry['registerComponents'];
export declare const getComponent: Registry['getComponent'];
export declare const resolveComponentEntry: Registry['resolveComponentEntry'];
export declare const listRegisteredComponents: Registry['listRegisteredComponents'];
export declare const serverRegistry: typeof server;
export declare const clientRegistry: typeof client;
declare const _default: {
    registerComponent: (name: string, component: ComponentType) => void;
    registerComponents: (entries: Record<string, ComponentType>) => void;
    getComponent: (name: string) => ComponentType | undefined;
    resolveComponentEntry: (entry: {
        component?: string;
        componentPath?: string;
    }, fallback?: ComponentType) => ComponentType;
    listRegisteredComponents: () => string[];
    serverRegistry: typeof server;
    clientRegistry: typeof client;
};
export default _default;
//# sourceMappingURL=componentRegistry.d.ts.map
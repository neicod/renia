import type React from 'react';
type ComponentType = React.ComponentType<any>;
declare const registerComponent: (name: string, component: ComponentType) => void;
declare const registerComponents: (entries: Record<string, ComponentType>) => void;
declare const getComponent: (name: string) => ComponentType | undefined;
declare const resolveComponentEntry: (entry: {
    component?: string;
    componentPath?: string;
}, fallback?: ComponentType) => ComponentType;
declare const listRegisteredComponents: () => string[];
export { registerComponent, registerComponents, getComponent, resolveComponentEntry, listRegisteredComponents };
declare const _default: {
    registerComponent: (name: string, component: ComponentType) => void;
    registerComponents: (entries: Record<string, ComponentType>) => void;
    getComponent: (name: string) => ComponentType | undefined;
    resolveComponentEntry: (entry: {
        component?: string;
        componentPath?: string;
    }, fallback?: ComponentType) => ComponentType;
    listRegisteredComponents: () => string[];
};
export default _default;
//# sourceMappingURL=componentRegistryClient.d.ts.map
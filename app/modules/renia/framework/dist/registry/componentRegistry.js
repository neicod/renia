import * as server from '@renia/framework/registry/componentRegistryServer';
import * as client from '@renia/framework/registry/componentRegistryClient';
const isBrowser = typeof window !== 'undefined';
const active = isBrowser ? client : server;
export const registerComponent = (name, component) => active.registerComponent(name, component);
export const registerComponents = (entries) => active.registerComponents(entries);
export const getComponent = (name) => active.getComponent(name);
export const resolveComponentEntry = (entry, fallback) => active.resolveComponentEntry(entry, fallback);
export const listRegisteredComponents = () => active.listRegisteredComponents();
export const serverRegistry = server;
export const clientRegistry = client;
export default {
    registerComponent,
    registerComponents,
    getComponent,
    resolveComponentEntry,
    listRegisteredComponents,
    serverRegistry,
    clientRegistry
};

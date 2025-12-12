// @env: mixed
import type React from 'react';
import * as server from '@framework/registry/componentRegistryServer';
import * as client from '@framework/registry/componentRegistryClient';

type ComponentType = React.ComponentType<any>;

type Registry = {
  registerComponent: (name: string, component: ComponentType) => void;
  registerComponents: (entries: Record<string, ComponentType>) => void;
  getComponent: (name: string) => ComponentType | undefined;
  resolveComponentEntry: (
    entry: { component?: string; componentPath?: string },
    fallback?: ComponentType
  ) => ComponentType;
  listRegisteredComponents: () => string[];
};

const isBrowser = typeof window !== 'undefined';
const active: Registry = isBrowser ? client : server;

export const registerComponent: Registry['registerComponent'] = (name, component) =>
  active.registerComponent(name, component);

export const registerComponents: Registry['registerComponents'] = (entries) =>
  active.registerComponents(entries);

export const getComponent: Registry['getComponent'] = (name) => active.getComponent(name);

export const resolveComponentEntry: Registry['resolveComponentEntry'] = (entry, fallback) =>
  active.resolveComponentEntry(entry, fallback);

export const listRegisteredComponents: Registry['listRegisteredComponents'] = () =>
  active.listRegisteredComponents();

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

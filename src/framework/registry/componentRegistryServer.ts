// @env: server
import type React from 'react';

type ComponentType = React.ComponentType<any>;

const registry = new Map<string, ComponentType>();

const registerComponent = (name: string, component: ComponentType): void => {
  if (!name) return;
  registry.set(name, component);
};

const registerComponents = (entries: Record<string, ComponentType>): void => {
  Object.entries(entries).forEach(([name, component]) => registerComponent(name, component));
};

const getComponent = (name: string): ComponentType | undefined => registry.get(name);

const resolveComponentEntry = (
  entry: { component?: string; componentPath?: string },
  fallback?: ComponentType
): ComponentType => {
  const byPath = entry.componentPath ? registry.get(entry.componentPath) : undefined;
  if (byPath) return byPath;
  const byName = entry.component ? registry.get(entry.component) : undefined;
  if (byName) return byName;
  return fallback ?? (() => null);
};

const listRegisteredComponents = (): string[] => Array.from(registry.keys());

export {
  registerComponent,
  registerComponents,
  getComponent,
  resolveComponentEntry,
  listRegisteredComponents
};

export default {
  registerComponent,
  registerComponents,
  getComponent,
  resolveComponentEntry,
  listRegisteredComponents
};

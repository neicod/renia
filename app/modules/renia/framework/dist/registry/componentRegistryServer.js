const registry = new Map();
const registerComponent = (name, component) => {
    if (!name)
        return;
    registry.set(name, component);
};
const registerComponents = (entries) => {
    Object.entries(entries).forEach(([name, component]) => registerComponent(name, component));
};
const getComponent = (name) => registry.get(name);
const resolveComponentEntry = (entry, fallback) => {
    const byPath = entry.componentPath ? registry.get(entry.componentPath) : undefined;
    if (byPath)
        return byPath;
    const byName = entry.component ? registry.get(entry.component) : undefined;
    if (byName)
        return byName;
    return fallback ?? (() => null);
};
const listRegisteredComponents = () => Array.from(registry.keys());
export { registerComponent, registerComponents, getComponent, resolveComponentEntry, listRegisteredComponents };
export default {
    registerComponent,
    registerComponents,
    getComponent,
    resolveComponentEntry,
    listRegisteredComponents
};

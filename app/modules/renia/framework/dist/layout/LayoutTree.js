// @env: mixed
/**
 * Hierarchical layout tree system
 * Enables building a tree structure: page → header → control-menu → cart-icon
 * With fluent API: api.layout.at('page.control-menu').add(Component, 'cart-icon', { before: 'customer-status' })
 */
export class LayoutTreeBuilder {
    constructor() {
        this.nodeCache = new Map();
        this.root = {
            id: 'page',
            path: 'page',
            children: new Map()
        };
        this.nodeCache.set('page', this.root);
    }
    /**
     * Legacy API (disabled): use `at()` instead.
     */
    get(path) {
        throw new Error(`[Layout] LayoutTreeBuilder.get(...) is disabled. Use LayoutTreeBuilder.at(...) instead. (path="${path}")`);
    }
    /**
     * Get or create a node by dot-separated path.
     * @example at('page.control-menu') or at('control-menu') or at('header')
     */
    at(path) {
        // Normalize path - if doesn't start with 'page', prepend it
        const fullPath = path.startsWith('page.') || path === 'page' ? path : `page.${path}`;
        if (this.nodeCache.has(fullPath)) {
            return new LayoutNodeAPI(this.nodeCache.get(fullPath), this);
        }
        // Create missing nodes in path
        const parts = fullPath.split('.');
        let current = this.root;
        for (let i = 1; i < parts.length; i++) {
            const nodeId = parts[i];
            const nodePath = parts.slice(0, i + 1).join('.');
            if (!current.children.has(nodeId)) {
                const newNode = {
                    id: nodeId,
                    path: nodePath,
                    children: new Map(),
                    parent: current
                };
                current.children.set(nodeId, newNode);
                this.nodeCache.set(nodePath, newNode);
            }
            current = current.children.get(nodeId);
        }
        return new LayoutNodeAPI(current, this);
    }
    /**
     * Build final tree for rendering - sort all nodes recursively
     */
    build() {
        this.sortNode(this.root);
        return this.root;
    }
    /**
     * Get node by path (internal, returns the node directly)
     */
    getNode(path) {
        return this.nodeCache.get(path);
    }
    sortNode(node) {
        const children = Array.from(node.children.values());
        // Sort by sortOrder (before/after)
        children.sort((a, b) => {
            return this.compareSortOrder(a, b, children);
        });
        // Rebuild Map with sorted order (Maps maintain insertion order in JS)
        node.children.clear();
        for (const child of children) {
            node.children.set(child.id, child);
            this.sortNode(child); // Recursive sort
        }
    }
    compareSortOrder(aNode, bNode, allNodes) {
        const a = aNode.sortOrder;
        const b = bNode.sortOrder;
        // Default sort order is '-', which means first
        const aOrder = a ? Object.values(a)[0] : '-';
        const bOrder = b ? Object.values(b)[0] : '-';
        // If both have '-' (default), preserve insertion order (return 0)
        if (aOrder === '-' && bOrder === '-')
            return 0;
        // If a has '-', it comes first
        if (aOrder === '-')
            return -1;
        // If b has '-', it comes first
        if (bOrder === '-')
            return 1;
        // If a has 'before: X'
        if (a && 'before' in a && a.before === bNode.id)
            return -1;
        // If b has 'before: X'
        if (b && 'before' in b && b.before === aNode.id)
            return 1;
        // If a has 'after: X'
        if (a && 'after' in a && a.after === bNode.id)
            return 1;
        // If b has 'after: X'
        if (b && 'after' in b && b.after === aNode.id)
            return -1;
        // Default: preserve insertion order
        return 0;
    }
}
export class LayoutNodeAPI {
    constructor(node, tree) {
        this.node = node;
        this.tree = tree;
    }
    /**
     * Preferred API: Navigate to (or create) a node by path.
     * - If `path` starts with 'page', it's treated as absolute.
     * - Otherwise it's treated as relative to the current node.
     *
     * Examples:
     * - api.layout.at('control-menu').add(...)
     * - api.layout.at('header').at('menu').add(...)
     * - api.layout.at('page.header').add(...)
     */
    at(path) {
        if (!path)
            return this;
        const normalized = path.startsWith('page.') || path === 'page' ? path : `${this.node.path}.${path}`;
        return this.tree.at(normalized);
    }
    /**
     * Add child component to current node
     * @example node.add(MenuComponent, 'main-menu', { before: 'search-bar' })
     */
    add(component, id, options) {
        const childPath = `${this.node.path}.${id}`;
        const child = {
            id,
            path: childPath,
            component: typeof component === 'string' ? undefined : component,
            componentPath: typeof component === 'string' ? component : undefined,
            sortOrder: options?.sortOrder ?? { before: '-' }, // Default to first
            props: options?.props,
            meta: options?.meta,
            children: new Map(),
            parent: this.node
        };
        this.node.children.set(id, child);
        this.tree['nodeCache'].set(childPath, child); // Update cache
        return new LayoutNodeAPI(child, this.tree);
    }
    /**
     * Legacy API (disabled): use `at('child')` instead.
     */
    get(id) {
        throw new Error(`[Layout] layout.get(...) is disabled. Use layout.at(...) instead. Called with: ${this.node.path}.get('${id}')`);
    }
    /**
     * Remove child from current node
     */
    remove(id) {
        this.node.children.delete(id);
    }
    /**
     * Get current node path (e.g., 'page.header.control-menu')
     */
    getPath() {
        return this.node.path;
    }
    /**
     * Update sort order of this node within parent
     */
    setSortOrder(order) {
        this.node.sortOrder = order;
        return this;
    }
    /**
     * Get the underlying LayoutNode (internal use)
     */
    getNode() {
        return this.node;
    }
}

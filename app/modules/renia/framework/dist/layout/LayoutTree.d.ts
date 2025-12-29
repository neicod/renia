/**
 * Hierarchical layout tree system
 * Enables building a tree structure: page → header → control-menu → cart-icon
 * With fluent API: api.layout.at('page.control-menu').add(Component, 'cart-icon', { before: 'customer-status' })
 */
import type React from 'react';
export type SortOrder = {
    before?: string;
    after?: string;
};
export type LayoutNode = {
    id: string;
    path: string;
    component?: React.ComponentType<any> | string;
    componentPath?: string;
    props?: Record<string, unknown>;
    meta?: Record<string, unknown>;
    sortOrder?: SortOrder;
    children: Map<string, LayoutNode>;
    parent?: LayoutNode;
};
export declare class LayoutTreeBuilder {
    private root;
    private nodeCache;
    constructor();
    /**
     * Legacy API (disabled): use `at()` instead.
     */
    get(path: string): LayoutNodeAPI;
    /**
     * Get or create a node by dot-separated path.
     * @example at('page.control-menu') or at('control-menu') or at('header')
     */
    at(path: string): LayoutNodeAPI;
    /**
     * Build final tree for rendering - sort all nodes recursively
     */
    build(): LayoutNode;
    /**
     * Get node by path (internal, returns the node directly)
     */
    getNode(path: string): LayoutNode | undefined;
    private sortNode;
    private compareSortOrder;
}
export declare class LayoutNodeAPI {
    private node;
    private tree;
    constructor(node: LayoutNode, tree: LayoutTreeBuilder);
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
    at(path: string): LayoutNodeAPI;
    /**
     * Add child component to current node
     * @example node.add(MenuComponent, 'main-menu', { before: 'search-bar' })
     */
    add(component: React.ComponentType<any> | string, id: string, options?: {
        sortOrder?: SortOrder;
        props?: Record<string, unknown>;
        meta?: Record<string, unknown>;
    }): LayoutNodeAPI;
    /**
     * Legacy API (disabled): use `at('child')` instead.
     */
    get(id: string): LayoutNodeAPI;
    /**
     * Remove child from current node
     */
    remove(id: string): void;
    /**
     * Get current node path (e.g., 'page.header.control-menu')
     */
    getPath(): string;
    /**
     * Update sort order of this node within parent
     */
    setSortOrder(order: SortOrder): LayoutNodeAPI;
    /**
     * Get the underlying LayoutNode (internal use)
     */
    getNode(): LayoutNode;
}
//# sourceMappingURL=LayoutTree.d.ts.map
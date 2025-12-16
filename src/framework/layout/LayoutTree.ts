// @env: mixed
/**
 * Hierarchical layout tree system
 * Enables building a tree structure: page → header → control-menu → cart-icon
 * With fluent API: api.layout.get('page.header.control-menu').add(Component, 'cart-icon', { before: 'customer-status' })
 */

import type React from 'react';

export type SortOrder = {
  before?: string;
  after?: string;
};

export type LayoutNode = {
  id: string;
  path: string; // e.g., 'page.header.control-menu'
  component?: React.ComponentType<any> | string;
  componentPath?: string;
  props?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  sortOrder?: SortOrder;
  children: Map<string, LayoutNode>;
  parent?: LayoutNode;
};

export class LayoutTreeBuilder {
  private root: LayoutNode;
  private nodeCache: Map<string, LayoutNode> = new Map();

  constructor() {
    this.root = {
      id: 'page',
      path: 'page',
      children: new Map()
    };
    this.nodeCache.set('page', this.root);
  }

  /**
   * Get or create a node by dot-separated path
   * @example get('page.header.control-menu') or get('header.control-menu') or get('header')
   */
  get(path: string): LayoutNodeAPI {
    // Normalize path - if doesn't start with 'page', prepend it
    const fullPath = path.startsWith('page.') || path === 'page' ? path : `page.${path}`;

    if (this.nodeCache.has(fullPath)) {
      return new LayoutNodeAPI(this.nodeCache.get(fullPath)!, this);
    }

    // Create missing nodes in path
    const parts = fullPath.split('.');
    let current = this.root;

    for (let i = 1; i < parts.length; i++) {
      const nodeId = parts[i];
      const nodePath = parts.slice(0, i + 1).join('.');

      if (!current.children.has(nodeId)) {
        const newNode: LayoutNode = {
          id: nodeId,
          path: nodePath,
          children: new Map(),
          parent: current
        };
        current.children.set(nodeId, newNode);
        this.nodeCache.set(nodePath, newNode);
      }

      current = current.children.get(nodeId)!;
    }

    return new LayoutNodeAPI(current, this);
  }

  /**
   * Build final tree for rendering - sort all nodes recursively
   */
  build(): LayoutNode {
    this.sortNode(this.root);
    return this.root;
  }

  /**
   * Get node by path (internal, returns the node directly)
   */
  getNode(path: string): LayoutNode | undefined {
    return this.nodeCache.get(path);
  }

  private sortNode(node: LayoutNode): void {
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

  private compareSortOrder(
    aNode: LayoutNode,
    bNode: LayoutNode,
    allNodes: LayoutNode[]
  ): number {
    const a = aNode.sortOrder;
    const b = bNode.sortOrder;

    // Default sort order is '-', which means first
    const aOrder = a ? Object.values(a)[0] : '-';
    const bOrder = b ? Object.values(b)[0] : '-';

    // If both have '-' (default), preserve insertion order (return 0)
    if (aOrder === '-' && bOrder === '-') return 0;

    // If a has '-', it comes first
    if (aOrder === '-') return -1;

    // If b has '-', it comes first
    if (bOrder === '-') return 1;

    // If a has 'before: X'
    if (a && 'before' in a && a.before === bNode.id) return -1;

    // If b has 'before: X'
    if (b && 'before' in b && b.before === aNode.id) return 1;

    // If a has 'after: X'
    if (a && 'after' in a && a.after === bNode.id) return 1;

    // If b has 'after: X'
    if (b && 'after' in b && b.after === aNode.id) return -1;

    // Default: preserve insertion order
    return 0;
  }
}

export class LayoutNodeAPI {
  constructor(
    private node: LayoutNode,
    private tree: LayoutTreeBuilder
  ) {}

  /**
   * Add child component to current node
   * @example node.add(MenuComponent, 'main-menu', { before: 'search-bar' })
   */
  add(
    component: React.ComponentType<any> | string,
    id: string,
    options?: {
      sortOrder?: SortOrder;
      props?: Record<string, unknown>;
      meta?: Record<string, unknown>;
    }
  ): LayoutNodeAPI {
    const childPath = `${this.node.path}.${id}`;

    const child: LayoutNode = {
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
   * Get or create child of current node
   * @example node.get('header').add(...)
   */
  get(id: string): LayoutNodeAPI {
    const childPath = `${this.node.path}.${id}`;

    if (!this.node.children.has(id)) {
      const newNode: LayoutNode = {
        id,
        path: childPath,
        children: new Map(),
        parent: this.node
      };
      this.node.children.set(id, newNode);
      this.tree['nodeCache'].set(childPath, newNode);
    }

    return new LayoutNodeAPI(this.node.children.get(id)!, this.tree);
  }

  /**
   * Remove child from current node
   */
  remove(id: string): void {
    this.node.children.delete(id);
  }

  /**
   * Get current node path (e.g., 'page.header.control-menu')
   */
  getPath(): string {
    return this.node.path;
  }

  /**
   * Update sort order of this node within parent
   */
  setSortOrder(order: SortOrder): LayoutNodeAPI {
    this.node.sortOrder = order;
    return this;
  }

  /**
   * Get the underlying LayoutNode (internal use)
   */
  getNode(): LayoutNode {
    return this.node;
  }
}

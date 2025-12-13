// @env: mixed
export type MenuItem = {
  id: string;
  label: string;
  url: string;
  type?: 'category' | 'cms' | 'custom' | string;
  children?: MenuItem[];
  position?: number;
  includeInMenu?: boolean;
  meta?: Record<string, unknown>;
};

export class MenuTree {
  root: MenuItem[];

  constructor(items: MenuItem[] = []) {
    this.root = items;
  }

  flatten(): MenuItem[] {
    const result: MenuItem[] = [];
    const walk = (nodes: MenuItem[]) => {
      for (const node of nodes) {
        result.push(node);
        if (node.children?.length) walk(node.children);
      }
    };
    walk(this.root);
    return result;
  }

  sort(compare?: (a: MenuItem, b: MenuItem) => number): MenuTree {
    const cmp =
      compare ??
      ((a: MenuItem, b: MenuItem) => {
        if (a.position !== undefined && b.position !== undefined) {
          return a.position - b.position;
        }
        return a.label.localeCompare(b.label);
      });

    const sortNodes = (nodes: MenuItem[]) => {
      nodes.sort(cmp);
      nodes.forEach((n) => n.children && sortNodes(n.children));
    };

    sortNodes(this.root);
    return this;
  }
}

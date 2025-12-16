// @env: mixed
import type { ArgValue, FragmentDef, Operation, OperationKind, SelectionNode } from './types';
import { GraphQLRenderer } from './rendering/GraphQLRenderer';

export class QueryBuilder {
  private type: OperationKind;
  private name?: string;
  private variables: Record<string, string> = {};
  private selection: SelectionNode[] = [];
  private fragments: Record<string, FragmentDef> = {};
  private rawSource?: string;

  constructor(typeOrSource: OperationKind | string) {
    if (typeOrSource === 'query' || typeOrSource === 'mutation') {
      this.type = typeOrSource;
    } else {
      this.type = 'query';
      this.rawSource = typeOrSource;
    }
  }

  setName(name: string) {
    this.name = name;
    return this;
  }

  setVariable(name: string, type: string) {
    this.variables[name] = type;
    return this;
  }

  addField(path: string[], name: string, opts?: { alias?: string; args?: Record<string, ArgValue> }) {
    const node = this.ensurePath(path);
    const existing = node.children?.find((c) => c.name === name && c.alias === opts?.alias);
    if (existing) {
      if (opts?.args) existing.args = { ...existing.args, ...opts.args };
      return this;
    }
    const child: SelectionNode = {
      name,
      alias: opts?.alias,
      args: opts?.args,
      children: []
    };
    node.children = node.children ?? [];
    node.children.push(child);
    return this;
  }

  removeField(path: string[], name: string) {
    const node = this.ensurePath(path);
    if (node.children) {
      node.children = node.children.filter((c) => c.name !== name);
    }
    return this;
  }

  addFragment(name: string, selection: SelectionNode[], on?: string) {
    this.fragments[name] = { name, on, selection };
    return this;
  }

  spreadFragment(path: string[], fragmentName: string) {
    const node = this.ensurePath(path);
    const fragNode: SelectionNode = { name: fragmentName, fragment: fragmentName };
    node.children = node.children ?? [];
    if (!node.children.find((c) => c.fragment === fragmentName)) {
      node.children.push(fragNode);
    }
    return this;
  }

  inlineFragment(path: string[], onType: string, selection: SelectionNode[]) {
    const node = this.ensurePath(path);

    const inlineNode: SelectionNode = { name: '__inline', inline: onType, children: selection };
    node.children = node.children ?? [];
    node.children.push(inlineNode);
    return this;
  }

  ensurePath(path: string[]): SelectionNode {
    let current: SelectionNode = { name: '__root', children: this.selection };
    for (const segment of path) {
      if (!current.children) current.children = [];
      let next = current.children.find((c) => c.name === segment);
      if (!next) {
        next = { name: segment, children: [] };
        current.children.push(next);
      }
      current = next;
    }
    return current;
  }

  toObject(): Operation {
    if (this.rawSource) {
      return {
        type: this.type,
        name: this.name,
        variables: { ...this.variables },
        selection: this.selection,
        fragments: { ...this.fragments }
      };
    }
    return {
      type: this.type,
      name: this.name,
      variables: { ...this.variables },
      selection: this.selection,
      fragments: { ...this.fragments }
    };
  }

  toString(): string {
    if (this.rawSource) {
      return this.rawSource;
    }
    const renderer = new GraphQLRenderer();
    return renderer.render(this.toObject());
  }
}

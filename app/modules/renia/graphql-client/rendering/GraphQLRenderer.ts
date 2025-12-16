// @env: mixed

import type { ArgValue, FragmentDef, Operation, SelectionNode } from '../types';

export class GraphQLRenderer {
  private argToString(v: ArgValue): string {
    return typeof v === 'string' ? v : v === null ? 'null' : JSON.stringify(v);
  }

  private renderArgs(args?: Record<string, ArgValue>): string {
    return args && Object.keys(args).length
      ? `(${Object.entries(args)
          .map(([k, v]) => `${k}: ${this.argToString(v)}`)
          .join(', ')})`
      : '';
  }

  private renderSelection(nodes: SelectionNode[], fragments?: Record<string, FragmentDef>): string {
    const lines: string[] = [];

    for (const node of nodes) {
      if (node.fragment) {
        lines.push(`...${node.fragment}`);
        continue;
      }
      if (node.inline) {
        const inner = node.children ? this.renderSelection(node.children, fragments) : '';
        lines.push(`... on ${node.inline} ${inner}`);
        continue;
      }
      const args = this.renderArgs(node.args);
      const alias = node.alias ? `${node.alias}: ` : '';
      if (node.children && node.children.length > 0) {
        const inner = this.renderSelection(node.children, fragments);
        lines.push(`${alias}${node.name}${args} ${inner}`);
      } else {
        lines.push(`${alias}${node.name}${args}`);
      }
    }

    return `{ ${lines.join(' ')} }`;
  }

  private renderFragments(fragments?: Record<string, FragmentDef>): string {
    return fragments
      ? Object.values(fragments)
          .map((f) => {
            const on = f.on ? ` on ${f.on}` : '';
            const sel = this.renderSelection(f.selection, fragments);
            return `fragment ${f.name}${on} ${sel}`;
          })
          .join('\n')
      : '';
  }

  render(operation: Operation): string {
    const vars =
      operation.variables && Object.keys(operation.variables).length
        ? `(${Object.entries(operation.variables)
            .map(([k, v]) => `$${k}: ${v}`)
            .join(', ')})`
        : '';
    const sel = this.renderSelection(operation.selection, operation.fragments);
    const op = `${operation.type}${operation.name ? ' ' + operation.name : ''}${vars} ${sel}`;
    const frags = this.renderFragments(operation.fragments);
    return frags ? `${op}\n\n${frags}` : op;
  }
}

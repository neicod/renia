// @env: mixed
export class GraphQLRenderer {
    valueToString(v) {
        if (v === null)
            return 'null';
        if (typeof v === 'string')
            return v; // raw GraphQL literal
        if (typeof v === 'number' || typeof v === 'boolean')
            return String(v);
        if (Array.isArray(v))
            return `[${v.map((x) => this.valueToString(x)).join(', ')}]`;
        return `{ ${Object.entries(v)
            .map(([k, x]) => `${k}: ${this.valueToString(x)}`)
            .join(', ')} }`;
    }
    renderArgs(args) {
        return args && Object.keys(args).length
            ? `(${Object.entries(args)
                .map(([k, v]) => `${k}: ${this.valueToString(v)}`)
                .join(', ')})`
            : '';
    }
    renderDirectives(directives) {
        if (!directives || directives.length === 0)
            return '';
        return ` ${directives
            .map((d) => {
            const args = this.renderArgs(d.args);
            return `@${d.name}${args}`;
        })
            .join(' ')}`;
    }
    renderSelection(nodes, fragments) {
        const lines = [];
        for (const node of nodes) {
            if (node.fragment) {
                const directives = this.renderDirectives(node.directives);
                lines.push(`...${node.fragment}${directives}`);
                continue;
            }
            if (node.inline) {
                const inner = node.children ? this.renderSelection(node.children, fragments) : '';
                const directives = this.renderDirectives(node.directives);
                lines.push(`... on ${node.inline}${directives} ${inner}`);
                continue;
            }
            const args = this.renderArgs(node.args);
            const directives = this.renderDirectives(node.directives);
            const alias = node.alias ? `${node.alias}: ` : '';
            if (node.children && node.children.length > 0) {
                const inner = this.renderSelection(node.children, fragments);
                lines.push(`${alias}${node.name}${args}${directives} ${inner}`);
            }
            else {
                lines.push(`${alias}${node.name}${args}${directives}`);
            }
        }
        return `{ ${lines.join(' ')} }`;
    }
    renderFragments(fragments) {
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
    render(operation) {
        const vars = operation.variables && Object.keys(operation.variables).length
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

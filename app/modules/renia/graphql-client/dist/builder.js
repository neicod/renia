import { GraphQLRenderer } from './rendering/GraphQLRenderer';
import { SelectionBuilder } from './fluent/SelectionBuilder';
import { SnippetParser } from './fluent/SnippetParser';
import { formatPath, parsePath } from './fluent/path';
export class QueryBuilder {
    constructor(typeOrSource) {
        this.variables = {};
        this.selection = [];
        this.fragments = {};
        if (typeOrSource === 'query' || typeOrSource === 'mutation') {
            this.type = typeOrSource;
        }
        else {
            this.type = 'query';
            this.rawSource = typeOrSource;
        }
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setVariable(name, type) {
        this.variables[name] = type;
        return this;
    }
    /**
     * Navigate to an existing selection path (dot-separated) and return a fluent SelectionBuilder.
     *
     * Path **must exist**; this method never creates missing segments.
     * Use `add/merge` at a parent first to create structure.
     *
     * @example
     * qb.add('removeItemFromCart');
     * qb.at('removeItemFromCart').add('user_errors { code message }');
     */
    at(path) {
        const segments = parsePath(path);
        if (segments.length === 0)
            return new SelectionBuilder(() => this.selection, '');
        const node = this.findPathNodeOrThrow(segments);
        const label = formatPath(segments);
        return new SelectionBuilder(() => (node.children ?? (node.children = [])), label);
    }
    /**
     * Fluent shorthand for `qb.at('').add(...)`.
     */
    add(snippetOrField) {
        this.at('').add(snippetOrField);
        return this;
    }
    /**
     * Fluent shorthand for `qb.at('').merge(...)`.
     */
    merge(snippet) {
        this.at('').merge(snippet);
        return this;
    }
    /**
     * Fluent shorthand for `qb.at('').remove(...)`.
     */
    remove(fieldOrResponseKey) {
        this.at('').remove(fieldOrResponseKey);
        return this;
    }
    /**
     * @deprecated Prefer fluent API, e.g. `qb.at('cart').add('items { sku qty }')`.
     */
    addField(path, name, opts) {
        const node = this.ensurePath(path);
        const existing = node.children?.find((c) => c.name === name && c.alias === opts?.alias);
        if (existing) {
            if (opts?.args)
                existing.args = { ...existing.args, ...opts.args };
            return this;
        }
        const child = {
            name,
            alias: opts?.alias,
            args: opts?.args,
            children: []
        };
        node.children = node.children ?? [];
        node.children.push(child);
        return this;
    }
    /**
     * @deprecated Prefer fluent API, e.g. `qb.at('cart').remove('total')`.
     */
    removeField(path, name) {
        const node = this.ensurePath(path);
        if (node.children) {
            node.children = node.children.filter((c) => c.name !== name);
        }
        return this;
    }
    addFragment(name, selection, on) {
        const parsedSelection = typeof selection === 'string' ? new SnippetParser().parseSelectionSnippet(selection) : selection;
        this.fragments[name] = { name, on, selection: parsedSelection };
        return this;
    }
    /**
     * @deprecated Prefer fluent API for selections; fragment spreads can be added via `add('...FragmentName')` at a path.
     */
    spreadFragment(path, fragmentName) {
        const node = this.ensurePath(path);
        const fragNode = { name: fragmentName, fragment: fragmentName };
        node.children = node.children ?? [];
        if (!node.children.find((c) => c.fragment === fragmentName)) {
            node.children.push(fragNode);
        }
        return this;
    }
    /**
     * @deprecated Prefer fluent API, e.g. `qb.at('cart').add('... on Bundle { bundleItems { sku } }')`.
     */
    inlineFragment(path, onType, selection) {
        const node = this.ensurePath(path);
        const inlineNode = { name: '__inline', inline: onType, children: selection };
        node.children = node.children ?? [];
        node.children.push(inlineNode);
        return this;
    }
    ensurePath(path) {
        let current = { name: '__root', children: this.selection };
        for (const segment of path) {
            if (!current.children)
                current.children = [];
            let next = current.children.find((c) => c.name === segment);
            if (!next) {
                next = { name: segment, children: [] };
                current.children.push(next);
            }
            current = next;
        }
        return current;
    }
    findPathNodeOrThrow(segments) {
        let currentChildren = this.selection;
        let currentNode = null;
        for (const segment of segments) {
            currentNode = currentChildren.find((n) => !n.fragment && !n.inline && n.name === segment) ?? null;
            if (!currentNode) {
                throw new Error(`Path not found: ${formatPath(segments)} (missing: ${segment})`);
            }
            currentChildren = currentNode.children ?? [];
        }
        return currentNode;
    }
    toObject() {
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
    toString() {
        if (this.rawSource) {
            return this.rawSource;
        }
        const renderer = new GraphQLRenderer();
        return renderer.render(this.toObject());
    }
}

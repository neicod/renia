// @env: mixed
import { parsePath, formatPath } from './path';
import { SnippetParser } from './SnippetParser';
import { SelectionMerger } from './SelectionMerger';
const responseKeyOf = (node) => node.alias ?? node.name;
export class FieldBuilder {
    constructor(getNode, pathLabel) {
        this.getNode = getNode;
        this.pathLabel = pathLabel;
    }
    node() {
        return this.getNode();
    }
    getSelection() {
        const node = this.getNode();
        return new SelectionBuilder(() => (node.children ?? (node.children = [])), this.pathLabel);
    }
    add(snippetOrField) {
        this.getSelection().add(snippetOrField);
        return this;
    }
    merge(snippet) {
        this.getSelection().merge(snippet);
        return this;
    }
    at(path) {
        return this.getSelection().at(path);
    }
}
export class SelectionBuilder {
    constructor(getSelectionNodes, pathLabel) {
        this.getSelectionNodes = getSelectionNodes;
        this.pathLabel = pathLabel;
        this.parser = new SnippetParser();
        this.merger = new SelectionMerger({ path: pathLabel });
    }
    selection() {
        return this.getSelectionNodes();
    }
    add(snippetOrField) {
        const nodes = this.parser.parseSelectionSnippet(snippetOrField);
        if (nodes.length === 0)
            return this;
        this.merger.mergeInto(this.selection(), nodes);
        return this;
    }
    merge(snippet) {
        return this.add(snippet);
    }
    fields(...names) {
        for (const name of names.flatMap((n) => n.split(/\s+/).filter(Boolean))) {
            this.add(name);
        }
        return this;
    }
    remove(fieldOrResponseKey) {
        const key = fieldOrResponseKey.trim();
        if (!key)
            return this;
        const nodes = this.selection();
        const isSpread = key.startsWith('...');
        const needle = isSpread ? key.slice(3).trim() : key;
        const next = nodes.filter((n) => {
            if (isSpread)
                return !(n.fragment === needle);
            return !(responseKeyOf(n) === needle || n.name === needle);
        });
        nodes.splice(0, nodes.length, ...next);
        return this;
    }
    getField(fieldOrResponseKey) {
        const key = fieldOrResponseKey.trim();
        const node = this.selection().find((n) => !n.fragment && !n.inline && (responseKeyOf(n) === key || n.name === key));
        if (!node) {
            throw new Error(`Field not found at "${this.pathLabel || '<root>'}": ${key}`);
        }
        return new FieldBuilder(() => node, this.joinPath([responseKeyOf(node)]));
    }
    field(name, opts) {
        const n = name.trim();
        if (!n)
            throw new Error('Field name cannot be empty');
        const responseKey = opts?.alias ?? n;
        const nodes = this.selection();
        const existing = nodes.find((x) => !x.fragment && !x.inline && responseKeyOf(x) === responseKey);
        if (!existing) {
            const created = { name: n, alias: opts?.alias, args: opts?.args, children: [] };
            nodes.push(created);
            return new FieldBuilder(() => created, this.joinPath([responseKeyOf(created)]));
        }
        if (opts?.args) {
            existing.args = existing.args ?? {};
            for (const [k, v] of Object.entries(opts.args)) {
                const prev = existing.args[k];
                if (prev !== undefined && prev !== v) {
                    console.warn('GraphQL selection: overriding argument value', {
                        path: this.pathLabel,
                        responseKey,
                        arg: k,
                        from: prev,
                        to: v
                    });
                }
                existing.args[k] = v;
            }
        }
        return new FieldBuilder(() => existing, this.joinPath([responseKey]));
    }
    at(path) {
        const segments = parsePath(path);
        if (segments.length === 0)
            return this;
        let current = this;
        for (const segment of segments) {
            const node = current.selection().find((n) => !n.fragment && !n.inline && n.name === segment);
            if (!node) {
                throw new Error(`Path not found: ${this.joinPath(segments)} (missing: ${segment})`);
            }
            current = new SelectionBuilder(() => (node.children ?? (node.children = [])), current.joinPath([responseKeyOf(node)]));
        }
        return current;
    }
    joinPath(next) {
        const base = this.pathLabel ? parsePath(this.pathLabel) : [];
        return formatPath([...base, ...next]);
    }
}

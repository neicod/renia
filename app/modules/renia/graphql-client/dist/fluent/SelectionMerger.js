// @env: mixed
const responseKeyOf = (node) => node.alias ?? node.name;
const argsEqual = (a, b) => {
    if (a === b)
        return true;
    // Best-effort deep compare for warning suppression; fast path for most cases.
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    }
    catch {
        return false;
    }
};
export class SelectionMerger {
    constructor(opts) {
        this.warn = opts?.warn ?? ((message, meta) => console.warn(message, meta ?? {}));
        this.path = opts?.path ?? '';
    }
    mergeInto(target, incoming) {
        for (const node of incoming) {
            this.mergeNode(target, node);
        }
        return target;
    }
    mergeNode(target, incoming) {
        if (incoming.fragment) {
            const exists = target.some((n) => n.fragment === incoming.fragment);
            if (!exists)
                target.push(incoming);
            return;
        }
        if (incoming.inline) {
            const existing = target.find((n) => n.inline === incoming.inline && n.name === '__inline');
            if (!existing) {
                target.push(incoming);
                return;
            }
            const existingChildren = (existing.children ?? (existing.children = []));
            this.mergeInto(existingChildren, incoming.children ?? []);
            return;
        }
        const key = responseKeyOf(incoming);
        const existing = target.find((n) => !n.fragment && !n.inline && responseKeyOf(n) === key);
        if (!existing) {
            target.push(incoming);
            return;
        }
        if (existing.name !== incoming.name) {
            this.warn('GraphQL selection merge: overriding field name for same response key', {
                path: this.path,
                responseKey: key,
                from: existing.name,
                to: incoming.name
            });
            existing.name = incoming.name;
        }
        if (incoming.args) {
            existing.args = existing.args ?? {};
            for (const [k, v] of Object.entries(incoming.args)) {
                const prev = existing.args[k];
                if (prev !== undefined && !argsEqual(prev, v)) {
                    this.warn('GraphQL selection merge: overriding argument value', {
                        path: this.path,
                        responseKey: key,
                        arg: k,
                        from: prev,
                        to: v
                    });
                }
                existing.args[k] = v;
            }
        }
        if (incoming.directives && incoming.directives.length) {
            // Simple strategy: append missing directives by name; on conflict override args.
            existing.directives = existing.directives ?? [];
            for (const d of incoming.directives) {
                const prev = existing.directives.find((x) => x.name === d.name);
                if (!prev) {
                    existing.directives.push(d);
                    continue;
                }
                if (d.args) {
                    prev.args = prev.args ?? {};
                    for (const [k, v] of Object.entries(d.args)) {
                        const before = prev.args[k];
                        if (before !== undefined && !argsEqual(before, v)) {
                            this.warn('GraphQL selection merge: overriding directive argument', {
                                path: this.path,
                                responseKey: key,
                                directive: d.name,
                                arg: k,
                                from: before,
                                to: v
                            });
                        }
                        prev.args[k] = v;
                    }
                }
            }
        }
        if (incoming.children && incoming.children.length) {
            const existingChildren = (existing.children ?? (existing.children = []));
            this.mergeInto(existingChildren, incoming.children);
        }
    }
}

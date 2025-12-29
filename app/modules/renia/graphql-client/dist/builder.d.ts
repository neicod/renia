import type { ArgValue, Operation, OperationKind, SelectionNode } from './types';
import { SelectionBuilder } from './fluent/SelectionBuilder';
export declare class QueryBuilder {
    private type;
    private name?;
    private variables;
    private selection;
    private fragments;
    private rawSource?;
    constructor(typeOrSource: OperationKind | string);
    setName(name: string): this;
    setVariable(name: string, type: string): this;
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
    at(path?: string): SelectionBuilder;
    /**
     * Fluent shorthand for `qb.at('').add(...)`.
     */
    add(snippetOrField: string): this;
    /**
     * Fluent shorthand for `qb.at('').merge(...)`.
     */
    merge(snippet: string): this;
    /**
     * Fluent shorthand for `qb.at('').remove(...)`.
     */
    remove(fieldOrResponseKey: string): this;
    /**
     * @deprecated Prefer fluent API, e.g. `qb.at('cart').add('items { sku qty }')`.
     */
    addField(path: string[], name: string, opts?: {
        alias?: string;
        args?: Record<string, ArgValue>;
    }): this;
    /**
     * @deprecated Prefer fluent API, e.g. `qb.at('cart').remove('total')`.
     */
    removeField(path: string[], name: string): this;
    addFragment(name: string, selection: SelectionNode[] | string, on?: string): this;
    /**
     * @deprecated Prefer fluent API for selections; fragment spreads can be added via `add('...FragmentName')` at a path.
     */
    spreadFragment(path: string[], fragmentName: string): this;
    /**
     * @deprecated Prefer fluent API, e.g. `qb.at('cart').add('... on Bundle { bundleItems { sku } }')`.
     */
    inlineFragment(path: string[], onType: string, selection: SelectionNode[]): this;
    ensurePath(path: string[]): SelectionNode;
    private findPathNodeOrThrow;
    toObject(): Operation;
    toString(): string;
}
//# sourceMappingURL=builder.d.ts.map
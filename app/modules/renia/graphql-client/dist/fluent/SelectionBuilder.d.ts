import type { ArgValue, SelectionNode } from '../types';
export type FieldOptions = {
    alias?: string;
    args?: Record<string, ArgValue>;
};
export declare class FieldBuilder {
    private readonly getNode;
    private readonly pathLabel;
    constructor(getNode: () => SelectionNode, pathLabel: string);
    node(): SelectionNode;
    getSelection(): SelectionBuilder;
    add(snippetOrField: string): this;
    merge(snippet: string): this;
    at(path: string): SelectionBuilder;
}
export declare class SelectionBuilder {
    private readonly getSelectionNodes;
    private readonly pathLabel;
    private readonly parser;
    private readonly merger;
    constructor(getSelectionNodes: () => SelectionNode[], pathLabel: string);
    private selection;
    add(snippetOrField: string): this;
    merge(snippet: string): this;
    fields(...names: string[]): this;
    remove(fieldOrResponseKey: string): this;
    getField(fieldOrResponseKey: string): FieldBuilder;
    field(name: string, opts?: FieldOptions): FieldBuilder;
    at(path?: string): SelectionBuilder;
    private joinPath;
}
//# sourceMappingURL=SelectionBuilder.d.ts.map
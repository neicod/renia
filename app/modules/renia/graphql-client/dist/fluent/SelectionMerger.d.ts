import type { SelectionNode } from '../types';
export type SelectionMergerOptions = {
    warn?: (message: string, meta?: Record<string, unknown>) => void;
    path?: string;
};
export declare class SelectionMerger {
    private readonly warn;
    private readonly path;
    constructor(opts?: SelectionMergerOptions);
    mergeInto(target: SelectionNode[], incoming: SelectionNode[]): SelectionNode[];
    private mergeNode;
}
//# sourceMappingURL=SelectionMerger.d.ts.map
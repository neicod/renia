import type { SortOrder } from './LayoutTree';
export type ExtensionEntry = {
    host: string;
    outlet: string;
    id: string;
    componentPath: string;
    enabled?: boolean;
    props?: Record<string, unknown>;
    meta?: Record<string, unknown>;
    sortOrder?: SortOrder;
    /**
     * Insertion order fallback to keep deterministic rendering
     * (not meant to be relied on as a public API).
     */
    seq?: number;
};
export type ExtensionsSnapshot = Record<string, Record<string, ExtensionEntry[]>>;
export declare class ExtensionsRegistry {
    private snapshot;
    private seq;
    snapshotSorted(): ExtensionsSnapshot;
    component(host: string): {
        outlet: (outlet: string) => {
            add: (componentPath: string, id: string, options?: {
                sortOrder?: SortOrder;
                props?: Record<string, unknown>;
                meta?: Record<string, unknown>;
                enabled?: boolean;
            }) => void;
            remove: (id: string) => void;
            enable: (id: string) => void;
            disable: (id: string) => void;
            clear: () => void;
        };
    };
    get(host: string, outlet: string): ExtensionEntry[];
}
export default ExtensionsRegistry;
//# sourceMappingURL=ExtensionsRegistry.d.ts.map
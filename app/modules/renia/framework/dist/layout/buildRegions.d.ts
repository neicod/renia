import type { LayoutNode } from './LayoutTree';
export type RegionEntry = {
    region: string;
    id?: string;
    component?: string;
    componentPath?: string;
    enabled?: boolean;
    props?: Record<string, unknown>;
    meta?: Record<string, unknown>;
    priority?: number;
};
export type RegionsSnapshot = Record<string, RegionEntry[]>;
export declare const buildRegions: (root: LayoutNode) => RegionsSnapshot;
export default buildRegions;
//# sourceMappingURL=buildRegions.d.ts.map
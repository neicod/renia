import type { RegionsSnapshot } from './buildRegions';
import type { ExtensionsSnapshot } from './ExtensionsRegistry';
export type LayoutValidationIssue = {
    level: 'warn' | 'error';
    code: 'unknown_region' | 'duplicate_region_id' | 'missing_component' | 'invalid_component_ref' | 'duplicate_extension_id';
    message: string;
    data?: Record<string, unknown>;
};
export type ValidateLayoutArtifactsArgs = {
    regions: RegionsSnapshot;
    extensions?: ExtensionsSnapshot;
    isComponentRegistered: (name: string) => boolean;
    knownRegions?: string[];
};
export declare const validateLayoutArtifacts: ({ regions, extensions, isComponentRegistered, knownRegions }: ValidateLayoutArtifactsArgs) => LayoutValidationIssue[];
declare const _default: {
    validateLayoutArtifacts: ({ regions, extensions, isComponentRegistered, knownRegions }: ValidateLayoutArtifactsArgs) => LayoutValidationIssue[];
};
export default _default;
//# sourceMappingURL=validateArtifacts.d.ts.map
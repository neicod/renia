export type ModuleSource = 'modules' | 'node_modules';
export type ModuleRecord = {
    name: string;
    path: string;
    source: ModuleSource;
    enabled: boolean;
    dependencies: string[];
    missingDeps?: string[];
    hasRegistration: boolean;
    registrationPath?: string;
};
export type RegistryOptions = {
    modulesDir?: string;
    extraModulesDirs?: string[];
    nodeModulesDir?: string;
    configPath?: string;
    includeNodeModules?: boolean;
    statusMap?: Record<string, boolean | number | undefined>;
};
export declare const loadModuleRegistry: (options?: RegistryOptions) => Promise<ModuleRecord[]>;
declare const _default: {
    loadModuleRegistry: (options?: RegistryOptions) => Promise<ModuleRecord[]>;
};
export default _default;
//# sourceMappingURL=moduleRegistry.d.ts.map
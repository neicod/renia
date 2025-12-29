export type RouteDefinition = {
    path: string;
    componentPath?: string;
    component?: string;
    handler?: string;
    redirect?: string;
    status?: number;
    priority?: number;
    contexts?: string[];
    guards?: string[];
    meta?: Record<string, unknown>;
};
export type RouterOptions = {
    routesFileName?: string;
    configPath?: string;
    includeNodeModules?: boolean;
    statusMap?: Record<string, boolean | number | undefined>;
};
export type RouterEntry = RouteDefinition & {
    module: string;
};
//# sourceMappingURL=types.d.ts.map
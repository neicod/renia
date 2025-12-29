export type InterceptorContext = string;
export type InterceptorModule = {
    module: string;
    file: string;
    context: InterceptorContext;
};
export type InterceptorOptions = {
    configPath?: string;
    includeNodeModules?: boolean;
    includeDefault?: boolean;
    statusMap?: Record<string, boolean | number | undefined>;
    onError?: (info: {
        module: string;
        file: string;
        error: unknown;
    }) => void;
};
export declare const loadInterceptors: (context: InterceptorContext, options?: InterceptorOptions, api?: unknown) => Promise<InterceptorModule[]>;
//# sourceMappingURL=loadInterceptors.d.ts.map
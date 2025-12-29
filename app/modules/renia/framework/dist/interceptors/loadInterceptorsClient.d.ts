/**
 * Client-side interceptor loader
 * Uses dynamically generated map from scripts/generate-interceptor-map.mjs
 */
export type InterceptorContext = string;
export declare const loadInterceptorsClient: (context: InterceptorContext, api?: any, enabledModules?: string[], options?: {
    includeDefault?: boolean;
}) => Promise<void>;
export default loadInterceptorsClient;
//# sourceMappingURL=loadInterceptorsClient.d.ts.map
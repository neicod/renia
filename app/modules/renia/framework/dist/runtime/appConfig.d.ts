export type AppConfig = Record<string, unknown>;
/**
 * Reads the current app config for both SSR and CSR:
 * - server: prefers request-scoped context (AsyncLocalStorage) when available,
 * - browser: reads from window.__APP_BOOTSTRAP__.config,
 */
export declare const readAppConfig: () => AppConfig;
declare const _default: {
    readAppConfig: () => AppConfig;
};
export default _default;
//# sourceMappingURL=appConfig.d.ts.map
import React from 'react';
export type AppRuntime = 'ssr' | 'client';
export type AppEnvironment = {
    runtime: AppRuntime;
    storeCode?: string | null;
    store?: Record<string, unknown> | null;
};
type ProviderProps = AppEnvironment & {
    children: React.ReactNode;
};
export declare const AppEnvironmentProvider: React.FC<ProviderProps>;
export declare const useAppEnvironment: () => AppEnvironment;
declare const _default: {
    AppEnvironmentProvider: React.FC<ProviderProps>;
    useAppEnvironment: () => AppEnvironment;
};
export default _default;
//# sourceMappingURL=AppEnvContext.d.ts.map
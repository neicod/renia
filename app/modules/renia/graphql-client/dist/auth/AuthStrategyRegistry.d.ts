import type { AuthStrategy } from './AuthStrategy';
export declare const registerAuthStrategy: (strategy: AuthStrategy) => void;
export declare const getAuthStrategy: (type: string) => AuthStrategy | undefined;
export declare const hasAuthStrategy: (type: string) => boolean;
export declare const resetAuthStrategies: () => void;
//# sourceMappingURL=AuthStrategyRegistry.d.ts.map
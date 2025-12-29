import type { AuthStrategy } from './AuthStrategy';
export declare class BasicAuthStrategy implements AuthStrategy {
    private username;
    private password;
    readonly type = "basic";
    constructor(username: string, password: string);
    apply(headers: Record<string, string>): void;
}
//# sourceMappingURL=BasicAuthStrategy.d.ts.map
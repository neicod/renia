import type { AuthStrategy } from './AuthStrategy';
export declare class BearerAuthStrategy implements AuthStrategy {
    private token;
    readonly type = "bearer";
    constructor(token: string);
    apply(headers: Record<string, string>): void;
}
//# sourceMappingURL=BearerAuthStrategy.d.ts.map
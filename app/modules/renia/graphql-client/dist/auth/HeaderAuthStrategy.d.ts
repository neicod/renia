import type { AuthStrategy } from './AuthStrategy';
export declare class HeaderAuthStrategy implements AuthStrategy {
    private name;
    private value;
    readonly type = "header";
    constructor(name: string, value: string);
    apply(headers: Record<string, string>): void;
}
//# sourceMappingURL=HeaderAuthStrategy.d.ts.map
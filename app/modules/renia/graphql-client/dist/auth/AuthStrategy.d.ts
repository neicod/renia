export interface AuthStrategy {
    readonly type: string;
    apply(headers: Record<string, string>): void;
}
//# sourceMappingURL=AuthStrategy.d.ts.map
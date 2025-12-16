// @env: mixed

export interface AuthStrategy {
  readonly type: string;
  apply(headers: Record<string, string>): void;
}

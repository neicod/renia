// @env: mixed

import type { AuthStrategy } from './AuthStrategy';

export class BearerAuthStrategy implements AuthStrategy {
  readonly type = 'bearer';

  constructor(private token: string) {}

  apply(headers: Record<string, string>): void {
    headers['authorization'] = `Bearer ${this.token}`;
  }
}

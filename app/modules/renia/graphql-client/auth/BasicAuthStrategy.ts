// @env: mixed

import type { AuthStrategy } from './AuthStrategy';

export class BasicAuthStrategy implements AuthStrategy {
  readonly type = 'basic';

  constructor(private username: string, private password: string) {}

  apply(headers: Record<string, string>): void {
    const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    headers['authorization'] = `Basic ${credentials}`;
  }
}

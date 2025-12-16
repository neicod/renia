// @env: mixed

import type { AuthStrategy } from './AuthStrategy';

export class HeaderAuthStrategy implements AuthStrategy {
  readonly type = 'header';

  constructor(private name: string, private value: string) {}

  apply(headers: Record<string, string>): void {
    headers[this.name.toLowerCase()] = this.value;
  }
}

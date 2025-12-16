// @env: mixed

import type { AuthStrategy } from './AuthStrategy';

export class AuthHeaderApplier {
  apply(strategies: AuthStrategy[], headers: Record<string, string>): void {
    for (const strategy of strategies) {
      strategy.apply(headers);
    }
  }
}

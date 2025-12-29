// @env: mixed

import type { AuthStrategy } from 'renia-graphql-client';

/**
 * MagentoAuthStrategy - authentication for Magento customer tokens.
 *
 * Magento uses custom "authorization" header format for customer tokens.
 * This strategy encapsulates that logic.
 */
export class MagentoAuthStrategy implements AuthStrategy {
  readonly type = 'magento';

  constructor(private customerToken: string) {}

  apply(headers: Record<string, string>): void {
    // Magento customer token format
    headers['authorization'] = `Bearer ${this.customerToken}`;
  }
}

/**
 * MagentoAdminAuthStrategy - authentication for Magento admin tokens.
 *
 * Admin endpoints may use different token format if needed.
 */
export class MagentoAdminAuthStrategy implements AuthStrategy {
  readonly type = 'magento-admin';

  constructor(private adminToken: string) {}

  apply(headers: Record<string, string>): void {
    headers['authorization'] = `Bearer ${this.adminToken}`;
  }
}

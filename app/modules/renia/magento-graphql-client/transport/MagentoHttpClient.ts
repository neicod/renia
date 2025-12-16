// @env: mixed

import type { HttpClient, HttpResponse } from 'renia-graphql-client';
import { FetchHttpClient } from 'renia-graphql-client';

/**
 * MagentoHttpClient - custom HTTP client for Magento GraphQL requests.
 *
 * Wraps the base FetchHttpClient and adds Magento-specific handling:
 * - Endpoint resolution (proxy vs direct)
 * - Magento Host header support
 * - Magento-specific error handling
 */
export class MagentoHttpClient implements HttpClient {
  private inner: HttpClient;
  private hostHeader?: string;

  constructor(hostHeader?: string) {
    this.inner = new FetchHttpClient();
    this.hostHeader = hostHeader;
  }

  async execute(url: string, options: RequestInit): Promise<HttpResponse> {
    // Apply Magento Host header if configured
    if (this.hostHeader) {
      const headers = new Headers(options.headers);
      headers.set('host', this.hostHeader);
      options.headers = headers;
    }

    return this.inner.execute(url, options);
  }
}

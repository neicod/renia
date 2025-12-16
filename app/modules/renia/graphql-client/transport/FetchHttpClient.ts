// @env: browser

import type { HttpClient, HttpResponse } from './HttpClient';

export class FetchHttpClient implements HttpClient {
  async execute(url: string, options: RequestInit): Promise<HttpResponse> {
    const response = await fetch(url, options);
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      text: () => response.text()
    };
  }
}

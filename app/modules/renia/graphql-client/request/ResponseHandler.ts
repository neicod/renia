// @env: mixed

import type { GraphQLResponse } from '../types';
import type { HttpResponse as TransportHttpResponse } from '../transport/HttpClient';

export class ResponseHandler {
  async handle(response: TransportHttpResponse): Promise<GraphQLResponse> {
    this.validateStatus(response.status);

    const text = await response.text();
    let parsed: any;
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = {};
    }

    return {
      data: parsed.data,
      errors: parsed.errors,
      status: response.status,
      headers: response.headers
    };
  }

  private validateStatus(status: number): void {
    if (status === 401 || status === 403) {
      throw new Error(`Auth error: HTTP ${status}`);
    }
  }
}

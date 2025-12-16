// @env: mixed

import type { HttpClient } from './HttpClient';
import { FetchHttpClient } from './FetchHttpClient';

let defaultHttpClient: HttpClient | null = null;

export const registerHttpClient = (client: HttpClient): void => {
  defaultHttpClient = client;
};

export const getHttpClient = (): HttpClient => {
  if (defaultHttpClient) {
    return defaultHttpClient;
  }
  return new FetchHttpClient();
};

export const resetHttpClient = (): void => {
  defaultHttpClient = null;
};

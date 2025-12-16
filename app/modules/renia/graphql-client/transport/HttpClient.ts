// @env: mixed

export type HttpResponse = {
  status: number;
  headers: Record<string, string>;
  text: () => Promise<string>;
};

export interface HttpClient {
  execute(url: string, options: RequestInit): Promise<HttpResponse>;
}

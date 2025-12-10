import type { AuthOption, GraphQLRequest } from './types';
import { QueryBuilder } from './builder';

const applyAuthHeaders = (auth: AuthOption[] = [], headers: Record<string, string>) => {
  for (const item of auth) {
    if (item.type === 'bearer') {
      headers['authorization'] = `Bearer ${item.token}`;
    } else if (item.type === 'basic') {
      const value = Buffer.from(`${item.username}:${item.password}`).toString('base64');
      headers['authorization'] = `Basic ${value}`;
    } else if (item.type === 'header') {
      headers[item.name.toLowerCase()] = item.value;
    }
  }
};

const buildBody = (payload: GraphQLRequest['payload'], variables?: GraphQLRequest['variables']) => {
  if (typeof payload === 'string') {
    return { query: payload, variables };
  }
  if (payload instanceof QueryBuilder) {
    const op = payload.toObject();
    return { query: payload.toString(), variables: variables ?? op.variables };
  }
  return { query: payload };
};

export const executeRequest = async (req: GraphQLRequest) => {
  const method = req.method ?? 'POST';
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(req.headers ?? {})
  };

  applyAuthHeaders(req.auth ?? [], headers);

  const controller = new AbortController();
  const timeout = req.timeoutMs ?? 5000;
  const t = setTimeout(() => controller.abort(), timeout);

  try {
    const bodyContent = buildBody(req.payload, req.variables);

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal
    };

    if (method === 'GET') {
      const params = new URLSearchParams();
      params.set('query', bodyContent.query);
      if (bodyContent.variables) params.set('variables', JSON.stringify(bodyContent.variables));
      req.endpoint += (req.endpoint.includes('?') ? '&' : '?') + params.toString();
    } else {
      fetchOptions.body = JSON.stringify(bodyContent);
    }

    const response = await fetch(req.endpoint, fetchOptions);
    const text = await response.text();
    let parsed: any;
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = {};
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error(`Auth error: HTTP ${response.status}`);
    }

    return {
      data: parsed.data,
      errors: parsed.errors,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    if ((error as any)?.name === 'AbortError') {
      throw new Error(`GraphQL request timed out after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(t);
  }
};

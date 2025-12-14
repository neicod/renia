// @env: mixed
import type { AuthOption, GraphQLRequest, GraphQLPayload } from './types';
import { QueryBuilder } from './builder';
import { getLogger } from 'renia-logger';

const logger = getLogger();

const getEnv = (key: string) =>
  typeof process !== 'undefined' && process.env ? process.env[key] : undefined;

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

const isBuilderLike = (
  payload: GraphQLPayload
): payload is { toObject: () => any; toString: () => string } =>
  typeof (payload as any)?.toObject === 'function' && typeof (payload as any)?.toString === 'function';

const buildBody = (payload: GraphQLRequest['payload'], variables?: GraphQLRequest['variables']) => {
  if (typeof payload === 'string') {
    return { query: payload, variables };
  }
  if (payload instanceof QueryBuilder || isBuilderLike(payload)) {
    const op = payload.toObject();
    return { query: payload.toString(), variables: variables ?? op.variables };
  }
  return { query: payload };
};

const truncate = (value: string, max = 500) =>
  value.length > max ? `${value.slice(0, max)}…(truncated)` : value;

const pretty = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
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
  const started = Date.now();

  try {
    const bodyContent = buildBody(req.payload, req.variables);
    if (getEnv('GRAPHQL_LOG_REQUEST') !== '0') {

      let reqLog = {
        payload: req.payload instanceof QueryBuilder? req.payload.toString() : req.payload,
        variables: req.variables,
      };

      logger.info('renia-graphql-client', `REQUEST: ${method} ${req.operationId || 'query'}`, reqLog);
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal
    };

    if (method === 'GET') {
      const params = new URLSearchParams();
      params.set('query', bodyContent.query);
      if (bodyContent.variables) {
        params.set('variables', JSON.stringify(bodyContent.variables));
      }
      req.endpoint += (req.endpoint.includes('?') ? '&' : '?') + params.toString();
    } else {
      fetchOptions.body = JSON.stringify(bodyContent);
    }

    const response = await fetch(req.endpoint, fetchOptions);
    const duration = Date.now() - started;
    const text = await response.text();
    let parsed: any;
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = {};
    }

    if (getEnv('GRAPHQL_LOG_RESPONSE') !== '0') {
      if (parsed.errors) {
        logger.warn('executeRequest', 'GraphQL response has errors', {
          status: response.status,
          endpoint: req.endpoint,
          duration,
          errorCount: parsed.errors.length,
          operationId: req.operationId
        });
      } else {
        logger.info('RESPONSE: renia-graphql-client', `${method} ${req.operationId || 'query'}`, response);
      }
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
    const duration = Date.now() - started;
    logger.error('executeRequest', 'GraphQL request failed', {
      method,
      endpoint: req.endpoint,
      duration,
      operationId: req.operationId,
      errorMessage: (error as Error)?.message,
      errorName: (error as any)?.name
    });
    if ((error as any)?.name === 'AbortError') {
      throw new Error(`GraphQL request timed out after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(t);
  }
};

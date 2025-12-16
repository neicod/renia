// @env: mixed

import type { GraphQLRequest } from '../types';
import { QueryBuilder } from '../builder';

interface GraphQLBody {
  query: string;
  variables?: Record<string, unknown>;
}

const isBuilderLike = (
  payload: any
): payload is { toObject: () => any; toString: () => string } =>
  typeof payload?.toObject === 'function' && typeof payload?.toString === 'function';

export class RequestPayloadBuilder {
  build(payload: GraphQLRequest['payload'], variables?: GraphQLRequest['variables']): GraphQLBody {
    if (typeof payload === 'string') {
      return { query: payload, variables };
    }
    if (payload instanceof QueryBuilder || isBuilderLike(payload)) {
      const op = payload.toObject();
      return { query: payload.toString(), variables: variables ?? op.variables };
    }
    return { query: payload };
  }
}

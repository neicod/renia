// @env: mixed
import { QueryBuilder } from '../builder';
const isBuilderLike = (payload) => typeof payload?.toObject === 'function' && typeof payload?.toString === 'function';
export class RequestPayloadBuilder {
    build(payload, variables) {
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

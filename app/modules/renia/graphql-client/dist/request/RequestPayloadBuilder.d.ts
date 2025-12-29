import type { GraphQLRequest } from '../types';
interface GraphQLBody {
    query: string;
    variables?: Record<string, unknown>;
}
export declare class RequestPayloadBuilder {
    build(payload: GraphQLRequest['payload'], variables?: GraphQLRequest['variables']): GraphQLBody;
}
export {};
//# sourceMappingURL=RequestPayloadBuilder.d.ts.map
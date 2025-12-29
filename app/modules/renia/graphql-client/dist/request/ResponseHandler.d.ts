import type { GraphQLResponse } from '../types';
import type { HttpResponse as TransportHttpResponse } from '../transport/HttpClient';
export declare class ResponseHandler {
    handle(response: TransportHttpResponse): Promise<GraphQLResponse>;
    private validateStatus;
}
//# sourceMappingURL=ResponseHandler.d.ts.map
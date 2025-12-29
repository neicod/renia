import type { GraphQLRequest, GraphQLResponse } from '../types';
import type { HttpClient } from '../transport/HttpClient';
import type { GraphQLLogger } from '../logging/GraphQLLogger';
import { RequestPayloadBuilder } from './RequestPayloadBuilder';
import { ResponseHandler } from './ResponseHandler';
import { TimeoutManager } from './TimeoutManager';
export interface GraphQLRequestExecutorOptions {
    httpClient: HttpClient;
    logger: GraphQLLogger;
    payloadBuilder?: RequestPayloadBuilder;
    responseHandler?: ResponseHandler;
    timeoutManager?: TimeoutManager;
}
export declare class GraphQLRequestExecutor {
    private options;
    private payloadBuilder;
    private responseHandler;
    private timeoutManager;
    constructor(options: GraphQLRequestExecutorOptions);
    execute(req: GraphQLRequest): Promise<GraphQLResponse>;
    private applyAuthHeaders;
}
//# sourceMappingURL=GraphQLRequestExecutor.d.ts.map
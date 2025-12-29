// @env: mixed
import { QueryBuilder } from '../builder';
import { RequestPayloadBuilder } from './RequestPayloadBuilder';
import { ResponseHandler } from './ResponseHandler';
import { TimeoutManager } from './TimeoutManager';
export class GraphQLRequestExecutor {
    constructor(options) {
        this.options = options;
        this.payloadBuilder = options.payloadBuilder ?? new RequestPayloadBuilder();
        this.responseHandler = options.responseHandler ?? new ResponseHandler();
        this.timeoutManager = options.timeoutManager ?? new TimeoutManager();
    }
    async execute(req) {
        const method = req.method ?? 'POST';
        const headers = {
            'content-type': 'application/json',
            ...(req.headers ?? {})
        };
        this.applyAuthHeaders(req.auth ?? [], headers);
        const timeout = req.timeoutMs ?? 5000;
        const abortSignal = this.timeoutManager.createAbortSignal(timeout);
        const started = Date.now();
        try {
            const bodyContent = this.payloadBuilder.build(req.payload, req.variables);
            const payloadForLog = req.payload instanceof QueryBuilder ? req.payload.toString() : req.payload;
            this.options.logger.logRequest(req.operationId, method, payloadForLog, req.variables);
            const fetchOptions = {
                method,
                headers,
                signal: abortSignal.signal
            };
            let endpoint = req.endpoint;
            if (method === 'GET') {
                const params = new URLSearchParams();
                params.set('query', bodyContent.query);
                if (bodyContent.variables) {
                    params.set('variables', JSON.stringify(bodyContent.variables));
                }
                endpoint += (endpoint.includes('?') ? '&' : '?') + params.toString();
            }
            else {
                fetchOptions.body = JSON.stringify(bodyContent);
            }
            const response = await this.options.httpClient.execute(endpoint, fetchOptions);
            const duration = Date.now() - started;
            const result = await this.responseHandler.handle(response);
            const errorCount = Array.isArray(result.errors) ? result.errors.length : 0;
            this.options.logger.logResponse(response.status, req.operationId, duration, errorCount);
            return result;
        }
        catch (error) {
            const duration = Date.now() - started;
            this.options.logger.logError(req.operationId, method, req.endpoint, duration, error);
            if (this.timeoutManager.isTimeoutError(error)) {
                throw this.timeoutManager.createTimeoutError(timeout);
            }
            throw error;
        }
        finally {
            abortSignal.cleanup();
        }
    }
    applyAuthHeaders(auth = [], headers) {
        for (const item of auth) {
            if (item.type === 'bearer') {
                headers['authorization'] = `Bearer ${item.token}`;
            }
            else if (item.type === 'basic') {
                const value = Buffer.from(`${item.username}:${item.password}`).toString('base64');
                headers['authorization'] = `Basic ${value}`;
            }
            else if (item.type === 'header') {
                headers[item.name.toLowerCase()] = item.value;
            }
        }
    }
}

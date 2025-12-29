// @env: mixed

// Core exports
export * from './builder.js';
export * from './request.js';
export * from './types.js';

// Fluent selection API
export { SelectionBuilder } from './fluent/SelectionBuilder.js';
export { FieldBuilder } from './fluent/FieldBuilder.js';
export { SnippetParser } from './fluent/SnippetParser.js';
export { gql } from './fluent/snippetFormat.js';

// Transport layer
export type { HttpClient, HttpResponse } from './transport/HttpClient.js';
export { FetchHttpClient } from './transport/FetchHttpClient.js';
export { registerHttpClient, getHttpClient, resetHttpClient } from './transport/HttpClientFactory.js';

// Auth strategies
export type { AuthStrategy } from './auth/AuthStrategy.js';
export { BearerAuthStrategy } from './auth/BearerAuthStrategy.js';
export { BasicAuthStrategy } from './auth/BasicAuthStrategy.js';
export { HeaderAuthStrategy } from './auth/HeaderAuthStrategy.js';
export { AuthHeaderApplier } from './auth/AuthHeaderApplier.js';
export { registerAuthStrategy, getAuthStrategy, hasAuthStrategy, resetAuthStrategies } from './auth/AuthStrategyRegistry.js';

// Logging
export type { GraphQLLogger } from './logging/GraphQLLogger.js';
export { DefaultGraphQLLogger } from './logging/DefaultGraphQLLogger.js';

// Rendering
export { GraphQLRenderer } from './rendering/GraphQLRenderer.js';
export type { QuerySerializationFormatter } from './rendering/QuerySerializationFormatter.js';
export { DefaultGraphQLFormatter } from './rendering/DefaultGraphQLFormatter.js';

// Request execution
export { RequestPayloadBuilder } from './request/RequestPayloadBuilder.js';
export { ResponseHandler } from './request/ResponseHandler.js';
export { TimeoutManager } from './request/TimeoutManager.js';
export type { AbortSignalWrapper } from './request/TimeoutManager.js';
export { GraphQLRequestExecutor } from './request/GraphQLRequestExecutor.js';
export type { GraphQLRequestExecutorOptions } from './request/GraphQLRequestExecutor.js';

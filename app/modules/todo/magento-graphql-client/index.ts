// @env: mixed

// Request factory (original API - backward compatible)
export { MagentoGraphQLRequestFactory } from './requestFactory.js';

// New abstractions for SOLID-based integration
export { MagentoHttpClient } from './transport/MagentoHttpClient.js';
export { MagentoAuthStrategy, MagentoAdminAuthStrategy } from './auth/MagentoAuthStrategy.js';
export { MagentoGraphQLLogger } from './logging/MagentoGraphQLLogger.js';
export { getMagentoHttpClient, getMagentoGraphQLLogger, resetMagentoClients } from './services/index.js';

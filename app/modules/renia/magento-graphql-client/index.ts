// @env: mixed

// Request factory (original API - backward compatible)
export { MagentoGraphQLRequestFactory } from './requestFactory';

// New abstractions for SOLID-based integration
export { MagentoHttpClient } from './transport/MagentoHttpClient';
export { MagentoAuthStrategy, MagentoAdminAuthStrategy } from './auth/MagentoAuthStrategy';
export { MagentoGraphQLLogger } from './logging/MagentoGraphQLLogger';
export { getMagentoHttpClient, getMagentoGraphQLLogger, resetMagentoClients } from './services';

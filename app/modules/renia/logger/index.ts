/**
 * renia-logger - Centralized logging system with level-based filtering
 *
 * Usage:
 *   // Initialize at app startup
 *   import { initLogger, getLogger } from 'renia-logger';
 *
 *   initLogger({
 *     minLevel: 'INFO',
 *     enableTimestamp: true,
 *     environment: 'development'
 *   });
 *
 *   // Use anywhere
 *   const logger = getLogger();
 *   logger.info('fetchProduct', 'GraphQL request', { query: '...' });
 *   logger.error('fetchProduct', 'Failed to fetch', { error: err.message });
 */

// Types
export type { LogLevel, LoggerConfig, Logger } from './types/logger';
export { LOG_LEVEL_PRIORITY } from './types/logger';

// Services
export { initLogger, getLoggerConfig, updateLoggerConfig, shouldLog } from './services/loggerConfig';
export { getLogger, resetLogger } from './services/logger';

// Utilities
export { formatLogMessage, formatTimestamp, formatMetadata } from './utils/formatters';
export { getLogLevelColor, getBrowserLogStyle, colorize, COLORS } from './utils/colors';

// Hooks
export { useLogger } from './hooks/useLogger';

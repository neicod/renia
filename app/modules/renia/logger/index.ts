// @env: mixed

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
export type { LogLevel, LoggerConfig, Logger } from './types/logger.js';
export { LOG_LEVEL_PRIORITY } from './types/logger.js';

// Services
export { initLogger, getLoggerConfig, updateLoggerConfig, shouldLog } from './services/loggerConfig.js';
export { getLogger, resetLogger } from './services/logger.js';

// Utilities
export { formatLogMessage, formatTimestamp, formatMetadata } from './utils/formatters.js';
export { getLogLevelColor, getBrowserLogStyle, colorize, COLORS } from './utils/colors.js';

// Hooks
export { useLogger } from './hooks/useLogger.js';

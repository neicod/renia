import type { LoggerConfig, LogLevel } from '../types/logger';

/**
 * Global logger configuration
 */
let globalConfig: LoggerConfig = {
  minLevel: 'DEBUG',
  enableTimestamp: true,
  enableModule: true,
  environment: 'development'
};

/**
 * Default configuration per environment
 */
const DEFAULT_CONFIG: Record<string, LoggerConfig> = {
  development: {
    minLevel: 'DEBUG',
    enableTimestamp: true,
    enableModule: true,
    environment: 'development'
  },
  production: {
    minLevel: 'WARN',
    enableTimestamp: true,
    enableModule: true,
    environment: 'production'
  }
};

/**
 * Initialize logger with configuration
 * Should be called once at application startup
 */
export const initLogger = (config: Partial<LoggerConfig> = {}): void => {
  // Determine environment
  const environment = config.environment ?? detectEnvironment();

  // Merge with defaults for the environment
  const envDefaults = DEFAULT_CONFIG[environment] ?? DEFAULT_CONFIG.development;

  globalConfig = {
    ...envDefaults,
    ...config,
    environment
  };
};

/**
 * Get current logger configuration
 */
export const getLoggerConfig = (): LoggerConfig => {
  return { ...globalConfig };
};

/**
 * Update logger configuration at runtime
 */
export const updateLoggerConfig = (config: Partial<LoggerConfig>): void => {
  globalConfig = {
    ...globalConfig,
    ...config
  };
};

/**
 * Check if a log level should be displayed based on minimum level setting
 */
export const shouldLog = (level: LogLevel): boolean => {
  const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
    'DEBUG': 0,
    'INFO': 1,
    'WARN': 2,
    'ERROR': 3
  };

  const minPriority = LOG_LEVEL_PRIORITY[globalConfig.minLevel];
  const levelPriority = LOG_LEVEL_PRIORITY[level];

  return levelPriority >= minPriority;
};

/**
 * Detect environment from process.env or browser globals
 */
function detectEnvironment(): 'development' | 'production' {
  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'production') {
      return 'production';
    }
  }

  // Browser environment - check window
  if (typeof window !== 'undefined') {
    // Could check window.ENV or similar if available
    return 'development';
  }

  // Default to development
  return 'development';
}

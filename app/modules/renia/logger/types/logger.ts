/**
 * Hierarchical log levels from lowest to highest priority
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

/**
 * Log level priority mapping
 * Lower number = lower priority (shown by default)
 * Higher number = higher priority (always shown)
 */
export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  'DEBUG': 0,
  'INFO': 1,
  'WARN': 2,
  'ERROR': 3
};

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /**
   * Minimum log level to display
   * Only logs at this level or higher will be shown
   */
  minLevel: LogLevel;

  /**
   * Show timestamp in log output
   * @default true
   */
  enableTimestamp?: boolean;

  /**
   * Show module name in log output
   * @default true
   */
  enableModule?: boolean;

  /**
   * Environment-specific configuration
   */
  environment?: 'development' | 'production';
}

/**
 * Logger interface with methods for each log level
 */
export interface Logger {
  /**
   * Log a debug message with optional metadata
   * @param module Module/component name
   * @param message Message to log
   * @param data Optional metadata object
   */
  debug(module: string, message: string, data?: Record<string, any>): void;

  /**
   * Log an info message with optional metadata
   * @param module Module/component name
   * @param message Message to log
   * @param data Optional metadata object
   */
  info(module: string, message: string, data?: Record<string, any>): void;

  /**
   * Log a warning message with optional metadata
   * @param module Module/component name
   * @param message Message to log
   * @param data Optional metadata object
   */
  warn(module: string, message: string, data?: Record<string, any>): void;

  /**
   * Log an error message with optional metadata
   * @param module Module/component name
   * @param message Message to log
   * @param data Optional metadata object
   */
  error(module: string, message: string, data?: Record<string, any>): void;
}

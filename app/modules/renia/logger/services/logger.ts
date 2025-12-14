import type { Logger, LogLevel } from '../types/logger';
import { getLoggerConfig, shouldLog } from './loggerConfig';
import { formatLogMessage } from '../utils/formatters';
import { getLogLevelColor, getBrowserLogStyle, colorize } from '../utils/colors';

/**
 * Logger implementation
 * Handles all logging functionality with level-based filtering
 */
class LoggerImpl implements Logger {
  /**
   * Check if we're in a browser environment
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof process === 'undefined';
  }

  /**
   * Internal method to log at a specific level
   */
  private log(
    level: LogLevel,
    module: string,
    message: string,
    data?: Record<string, any>
  ): void {
    // Check if this level should be logged
    if (!shouldLog(level)) {
      return;
    }

    const config = getLoggerConfig();
    const formattedMessage = formatLogMessage(level, module, message, data, {
      enableTimestamp: config.enableTimestamp,
      enableModule: config.enableModule
    });

    // Output to console based on environment
    if (this.isBrowser()) {
      this.logInBrowser(level, formattedMessage, data);
    } else {
      this.logInNodeJS(level, formattedMessage);
    }
  }

  /**
   * Log in browser environment with styled output
   */
  private logInBrowser(
    level: LogLevel,
    message: string,
    data?: Record<string, any>
  ): void {
    const style = getBrowserLogStyle(level);
    const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';

    if (data && Object.keys(data).length > 0) {
      console[consoleMethod as any](`%c${level}%c ${message}`, style, '', data);
    } else {
      console[consoleMethod as any](`%c${level}%c ${message}`, style, '');
    }
  }

  /**
   * Log in Node.js environment with ANSI colors
   */
  private logInNodeJS(level: LogLevel, message: string): void {
    const color = getLogLevelColor(level);
    const coloredMessage = colorize(message, color);

    const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
    console[consoleMethod as any](coloredMessage);
  }

  debug(module: string, message: string, data?: Record<string, any>): void {
    this.log('DEBUG', module, message, data);
  }

  info(module: string, message: string, data?: Record<string, any>): void {
    this.log('INFO', module, message, data);
  }

  warn(module: string, message: string, data?: Record<string, any>): void {
    this.log('WARN', module, message, data);
  }

  error(module: string, message: string, data?: Record<string, any>): void {
    this.log('ERROR', module, message, data);
  }
}

/**
 * Global logger instance (singleton)
 */
let loggerInstance: Logger | null = null;

/**
 * Get the global logger instance
 * Creates it on first access
 */
export const getLogger = (): Logger => {
  if (!loggerInstance) {
    loggerInstance = new LoggerImpl();
  }
  return loggerInstance;
};

/**
 * Reset logger for testing
 */
export const resetLogger = (): void => {
  loggerInstance = null;
};

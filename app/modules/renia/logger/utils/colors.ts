// @env: mixed

import type { LogLevel } from '../types/logger.js';

/**
 * ANSI color codes for console output
 */
export const COLORS = {
  // Reset
  RESET: '\x1b[0m',

  // Foreground colors
  GRAY: '\x1b[90m',
  BLUE: '\x1b[34m',
  YELLOW: '\x1b[33m',
  RED: '\x1b[31m',

  // Styles
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m'
};

/**
 * Get color codes for a specific log level
 */
export const getLogLevelColor = (level: LogLevel): string => {
  switch (level) {
    case 'DEBUG':
      return COLORS.GRAY;
    case 'INFO':
      return COLORS.BLUE;
    case 'WARN':
      return COLORS.YELLOW;
    case 'ERROR':
      return COLORS.RED;
    default:
      return COLORS.RESET;
  }
};

/**
 * Apply color to console output
 * Works in Node.js and modern browsers that support console styling
 */
export const colorize = (text: string, color: string): string => {
  // Browser environment - use CSS styling if available
  if (typeof window !== 'undefined' && typeof process === 'undefined') {
    return text; // Will be styled via console.log %c syntax
  }

  // Node.js environment - use ANSI codes
  return `${color}${text}${COLORS.RESET}`;
};

/**
 * Get console style string for browser environment
 */
export const getBrowserLogStyle = (level: LogLevel): string => {
  const baseStyle = 'font-weight: bold; padding: 2px 6px; border-radius: 3px;';

  switch (level) {
    case 'DEBUG':
      return `${baseStyle} color: #666; background-color: #f0f0f0;`;
    case 'INFO':
      return `${baseStyle} color: #fff; background-color: #3b82f6;`;
    case 'WARN':
      return `${baseStyle} color: #000; background-color: #fbbf24;`;
    case 'ERROR':
      return `${baseStyle} color: #fff; background-color: #ef4444;`;
    default:
      return baseStyle;
  }
};

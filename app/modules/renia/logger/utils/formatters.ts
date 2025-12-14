import type { LogLevel } from '../types/logger';

/**
 * Format a timestamp as HH:MM:SS
 */
export const formatTimestamp = (date: Date = new Date()): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Format metadata object for display
 */
export const formatMetadata = (data?: Record<string, any>): string => {
  if (!data || Object.keys(data).length === 0) {
    return '';
  }

  try {
    return JSON.stringify(data);
  } catch (error) {
    return '[circular or non-serializable data]';
  }
};

/**
 * Format complete log message
 *
 * Format: [LEVEL] [HH:MM:SS] module: message { data }
 */
export const formatLogMessage = (
  level: LogLevel,
  module: string,
  message: string,
  data?: Record<string, any>,
  options: { enableTimestamp?: boolean; enableModule?: boolean } = {}
): string => {
  const { enableTimestamp = true, enableModule = true } = options;

  const parts: string[] = [];

  // Level tag
  parts.push(`[${level}]`);

  // Timestamp
  if (enableTimestamp) {
    parts.push(`[${formatTimestamp()}]`);
  }

  // Module and message
  if (enableModule) {
    parts.push(`${module}:`);
  }
  parts.push(message);

  // Metadata
  const metadata = formatMetadata(data);
  if (metadata) {
    parts.push(metadata);
  }

  return parts.join(' ');
};

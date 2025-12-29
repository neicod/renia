// @env: mixed

import { getLogger } from '../services/logger.js';
import type { Logger } from '../types/logger.js';

/**
 * React hook to get the logger instance
 * Usage:
 *   const logger = useLogger();
 *   logger.info('MyComponent', 'Component mounted');
 *
 * All logging is bound to the component's module context (no need to pass module name each time)
 */
export const useLogger = (module?: string): Logger => {
  const logger = getLogger();

  // Return the logger as-is if using it as a singleton
  // For convenience, developers can create a scoped logger:
  // const logger = useLogger('MyComponent');
  // logger.info('MyComponent', 'message');

  return logger;
};

export default useLogger;

// @env: mixed

import type { AuthStrategy } from './AuthStrategy';

let strategies = new Map<string, AuthStrategy>();

export const registerAuthStrategy = (strategy: AuthStrategy): void => {
  strategies.set(strategy.type, strategy);
};

export const getAuthStrategy = (type: string): AuthStrategy | undefined => {
  return strategies.get(type);
};

export const hasAuthStrategy = (type: string): boolean => {
  return strategies.has(type);
};

export const resetAuthStrategies = (): void => {
  strategies.clear();
};

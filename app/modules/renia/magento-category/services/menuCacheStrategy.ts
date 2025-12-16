// @env: mixed
import type { MenuItem } from 'renia-menu';

export interface ICacheStrategy<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  has(key: string): boolean;
  clear(): void;
}

/**
 * In-memory cache strategy dla menu kategorii.
 * Cache jest per-instance aplikacji (nie persistent).
 *
 * Implementuje SOLID: OCP (Open/Closed - można zastąpić inną strategią)
 *                     DIP (Dependency Inversion - abstraktowy interfejs)
 */
export class MenuCacheStrategy implements ICacheStrategy<MenuItem[]> {
  private cache: Map<string, MenuItem[]>;

  constructor() {
    this.cache = new Map();
  }

  get(key: string): MenuItem[] | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: MenuItem[]): void {
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Default cache instance (singleton)
export const menuCache = new MenuCacheStrategy();

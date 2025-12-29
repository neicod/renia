// @env: server

import type { PageContext } from './PageContext';
import type { RouteMeta } from '@renia/framework/router/routeMeta';

export type PageContextAugmenterArgs = {
  req: { path: string; url?: string };
  routeMeta: RouteMeta;
  routeContexts: string[];
};

export type PageContextAugmenter = (ctx: PageContext, args: PageContextAugmenterArgs) => void;

const globalAugmenters = new Set<PageContextAugmenter>();

export const registerPageContextAugmenter = (augmenter: PageContextAugmenter) => {
  globalAugmenters.add(augmenter);
};

export const getRegisteredPageContextAugmenters = (): PageContextAugmenter[] => [...globalAugmenters];

export const applyPageContextAugmenters = (ctx: PageContext, args: PageContextAugmenterArgs) => {
  for (const augmenter of globalAugmenters) {
    try {
      augmenter(ctx, args);
    } catch (error) {
      console.error('[PageContext] augmenter failed:', error);
    }
  }
  return ctx;
};

export default {
  registerPageContextAugmenter,
  getRegisteredPageContextAugmenters,
  applyPageContextAugmenters
};

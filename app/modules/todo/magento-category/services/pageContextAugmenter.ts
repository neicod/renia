// @env: mixed
import type { Category } from '../types/category';

import { registerPageContextAugmenter } from '@renia/framework/runtime/pageContextAugmenters';

export type CategoryPageContextCategory = Pick<
  Category,
  'id' | 'label' | 'urlPath' | 'description' | 'image'
>;

declare module '@renia/framework/runtime/PageContext' {
  interface PageContextExtensions {
    category?: {
      category?: CategoryPageContextCategory | null;
    };
  }
}

export const registerCategoryPageContextAugmenter = () => {
  registerPageContextAugmenter((ctx, { routeContexts, routeMeta }) => {
    const isCategoryContext = routeContexts.includes('category') || (routeMeta as any)?.type === 'category';
    if (!isCategoryContext) return;

    const category = ((routeMeta as any)?.category ?? null) as CategoryPageContextCategory | null;

    ctx.kind = ctx.kind ?? 'category';
    ctx.extensions = ctx.extensions ?? {};
    (ctx.extensions as any).category = { category };
  });
};

export default {
  registerCategoryPageContextAugmenter
};

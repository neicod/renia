// @env: mixed
import type { ProductInterface } from '../types.js';
import type { PageContext } from '@renia/framework/runtime/PageContext';
import type { PageContextAugmenterArgs } from '@renia/framework/runtime/pageContextAugmenters';
import { registerPageContextAugmenter } from '@renia/framework/runtime/pageContextAugmenters';

declare module '@renia/framework/runtime/PageContext' {
  interface PageContextExtensions {
    product?: {
      product?: ProductInterface | null;
      productUrlKey?: string | null;
    };
  }
}

export const registerProductPageContextAugmenter = () => {
  registerPageContextAugmenter((ctx: PageContext, { routeContexts, routeMeta }: PageContextAugmenterArgs) => {
    const isProductContext = routeContexts.includes('product') || (routeMeta as any)?.type === 'product';
    if (!isProductContext) return;

    const product = ((routeMeta as any)?.product ?? null) as ProductInterface | null;
    const productUrlKey = ((routeMeta as any)?.productUrlKey ?? null) as string | null;

    ctx.kind = ctx.kind ?? 'product';
    ctx.extensions = ctx.extensions ?? {};
    (ctx.extensions as any).product = { product, productUrlKey };
  });
};

export default {
  registerProductPageContextAugmenter
};

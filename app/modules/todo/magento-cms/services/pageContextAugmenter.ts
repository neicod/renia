// @env: mixed
import { registerPageContextAugmenter } from '@renia/framework/runtime/pageContextAugmenters';

declare module '@renia/framework/runtime/PageContext' {
  interface PageContextExtensions {
    cms?: {
      identifier?: string | null;
      title?: string | null;
    };
  }
}

export const registerCmsPageContextAugmenter = () => {
  registerPageContextAugmenter((ctx, { routeContexts, routeMeta }) => {
    const isCmsContext = routeContexts.includes('cms') || (routeMeta as any)?.type === 'cms';
    if (!isCmsContext) return;

    const identifier = typeof (routeMeta as any)?.cmsPageIdentifier === 'string' ? (routeMeta as any).cmsPageIdentifier : null;
    const title = typeof (routeMeta as any)?.cmsPage?.title === 'string' ? (routeMeta as any).cmsPage.title : null;

    ctx.kind = ctx.kind ?? 'cms';
    ctx.extensions = ctx.extensions ?? {};
    (ctx.extensions as any).cms = { identifier, title };
  });
};

export default {
  registerCmsPageContextAugmenter
};


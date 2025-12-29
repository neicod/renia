import type { PageContext } from './PageContext';
import type { RouteMeta } from '@renia/framework/router/routeMeta';
export type PageContextAugmenterArgs = {
    req: {
        path: string;
        url?: string;
    };
    routeMeta: RouteMeta;
    routeContexts: string[];
};
export type PageContextAugmenter = (ctx: PageContext, args: PageContextAugmenterArgs) => void;
export declare const registerPageContextAugmenter: (augmenter: PageContextAugmenter) => void;
export declare const getRegisteredPageContextAugmenters: () => PageContextAugmenter[];
export declare const applyPageContextAugmenters: (ctx: PageContext, args: PageContextAugmenterArgs) => PageContext;
declare const _default: {
    registerPageContextAugmenter: (augmenter: PageContextAugmenter) => void;
    getRegisteredPageContextAugmenters: () => PageContextAugmenter[];
    applyPageContextAugmenters: (ctx: PageContext, args: PageContextAugmenterArgs) => PageContext;
};
export default _default;
//# sourceMappingURL=pageContextAugmenters.d.ts.map
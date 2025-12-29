import { registerPageContextAugmenter } from '@renia/framework/runtime/pageContextAugmenters';
export const registerProductPageContextAugmenter = () => {
    registerPageContextAugmenter((ctx, { routeContexts, routeMeta }) => {
        const isProductContext = routeContexts.includes('product') || routeMeta?.type === 'product';
        if (!isProductContext)
            return;
        const product = (routeMeta?.product ?? null);
        const productUrlKey = (routeMeta?.productUrlKey ?? null);
        ctx.kind = ctx.kind ?? 'product';
        ctx.extensions = ctx.extensions ?? {};
        ctx.extensions.product = { product, productUrlKey };
    });
};
export default {
    registerProductPageContextAugmenter
};

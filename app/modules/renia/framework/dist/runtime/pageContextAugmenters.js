// @env: server
const globalAugmenters = new Set();
export const registerPageContextAugmenter = (augmenter) => {
    globalAugmenters.add(augmenter);
};
export const getRegisteredPageContextAugmenters = () => [...globalAugmenters];
export const applyPageContextAugmenters = (ctx, args) => {
    for (const augmenter of globalAugmenters) {
        try {
            augmenter(ctx, args);
        }
        catch (error) {
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

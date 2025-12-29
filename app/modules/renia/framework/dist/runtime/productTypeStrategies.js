const productTypeStrategies = {};
export const registerProductTypeComponentStrategy = (strategy) => {
    if (!strategy || typeof strategy !== 'object')
        return;
    if (!strategy.key || typeof strategy.key !== 'string')
        return;
    if (!strategy.components || typeof strategy.components !== 'object')
        return;
    if (!productTypeStrategies[strategy.key]) {
        productTypeStrategies[strategy.key] = {};
    }
    productTypeStrategies[strategy.key] = {
        ...productTypeStrategies[strategy.key],
        ...strategy.components
    };
};
export const getProductTypeComponent = (productType, key) => {
    return productTypeStrategies[key]?.[productType] ?? null;
};
export const listProductTypeStrategies = () => {
    const result = {};
    for (const [key, typeMap] of Object.entries(productTypeStrategies)) {
        result[key] = {};
        for (const [productType, component] of Object.entries(typeMap)) {
            result[key][productType] = component.name || 'anonymous';
        }
    }
    return result;
};
export default {
    registerProductTypeComponentStrategy,
    getProductTypeComponent,
    listProductTypeStrategies
};

// @env: mixed
let strategies = new Map();
export const registerAuthStrategy = (strategy) => {
    strategies.set(strategy.type, strategy);
};
export const getAuthStrategy = (type) => {
    return strategies.get(type);
};
export const hasAuthStrategy = (type) => {
    return strategies.has(type);
};
export const resetAuthStrategies = () => {
    strategies.clear();
};

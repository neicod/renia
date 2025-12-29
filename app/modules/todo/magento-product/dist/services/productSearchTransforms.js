const allowedConditions = new Set([
    'eq',
    'neq',
    'like',
    'in',
    'nin',
    'gt',
    'lt',
    'gteq',
    'lteq'
]);
const mapCondition = (condition) => {
    const normalized = typeof condition === 'string' ? condition.toLowerCase() : 'eq';
    return allowedConditions.has(normalized) ? normalized : 'eq';
};
export const buildFilterInput = (criteria) => {
    const filterGroups = criteria.filterGroups ?? [];
    const filter = {};
    filterGroups.forEach((group) => {
        (group.filters ?? []).forEach((f) => {
            const condition = mapCondition(f.conditionType);
            filter[f.field] = { [condition]: f.value };
        });
    });
    return Object.keys(filter).length ? filter : undefined;
};
export const buildSortInput = (criteria) => {
    if (!criteria.sortOrders || !criteria.sortOrders.length)
        return undefined;
    const sort = {};
    criteria.sortOrders.forEach((s) => {
        sort[s.field] = s.direction === 'DESC' ? 'DESC' : 'ASC';
    });
    return Object.keys(sort).length ? sort : undefined;
};
export default {
    buildFilterInput,
    buildSortInput
};

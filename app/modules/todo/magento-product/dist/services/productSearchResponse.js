import { mapProduct } from './productMapper.js';
const mapSortOptions = (sortFields) => {
    if (!Array.isArray(sortFields?.options))
        return undefined;
    return sortFields.options
        .map((opt) => typeof opt?.value === 'string' && typeof opt?.label === 'string'
        ? { value: opt.value, label: opt.label }
        : null)
        .filter(Boolean);
};
export const mapProductSearchResponse = (payload, criteria) => {
    const data = payload?.products ?? payload ?? {};
    const items = Array.isArray(data.items) ? data.items.map(mapProduct) : [];
    const total = typeof data.total_count === 'number' && Number.isFinite(data.total_count)
        ? data.total_count
        : items.length;
    return {
        items,
        totalCount: total,
        searchCriteria: criteria,
        sortOptions: mapSortOptions(data.sort_fields),
        defaultSort: typeof data.sort_fields?.default === 'string' && data.sort_fields.default.length
            ? data.sort_fields.default
            : undefined
    };
};
export default mapProductSearchResponse;

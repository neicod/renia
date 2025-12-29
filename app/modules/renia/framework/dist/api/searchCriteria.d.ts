import type { SortOrder } from './sortOrder';
export type ConditionType = 'eq' | 'neq' | 'like' | 'in' | 'nin' | 'gt' | 'lt' | 'gteq' | 'lteq' | 'finset' | 'from' | 'to';
export type Filter = {
    field: string;
    value: string | number | boolean;
    conditionType?: ConditionType;
};
export type FilterGroup = {
    filters: Filter[];
};
export type SearchCriteria = {
    filterGroups: FilterGroup[];
    sortOrders?: SortOrder[];
    pageSize?: number;
    currentPage?: number;
    search?: string;
};
//# sourceMappingURL=searchCriteria.d.ts.map
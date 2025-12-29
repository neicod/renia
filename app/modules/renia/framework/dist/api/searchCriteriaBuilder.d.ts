import type { Filter, SearchCriteria } from './searchCriteria';
import type { SortDirection } from './sortOrder';
export declare class SearchCriteriaBuilder {
    private filterGroups;
    private sortOrders;
    private pageSize?;
    private currentPage?;
    addFilter(field: string, value: string | number | boolean, conditionType?: Filter['conditionType'], groupIndex?: number): this;
    addFilterGroup(filters: Filter[]): this;
    addSort(field: string, direction?: SortDirection): this;
    setPageSize(size: number): this;
    setCurrentPage(page: number): this;
    reset(): this;
    build(): SearchCriteria;
}
export declare const createSearchCriteria: () => SearchCriteriaBuilder;
//# sourceMappingURL=searchCriteriaBuilder.d.ts.map
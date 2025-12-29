export class SearchCriteriaBuilder {
    constructor() {
        this.filterGroups = [];
        this.sortOrders = [];
    }
    addFilter(field, value, conditionType = 'eq', groupIndex = 0) {
        if (!this.filterGroups[groupIndex])
            this.filterGroups[groupIndex] = { filters: [] };
        this.filterGroups[groupIndex].filters.push({ field, value, conditionType });
        return this;
    }
    addFilterGroup(filters) {
        this.filterGroups.push({ filters });
        return this;
    }
    addSort(field, direction = 'ASC') {
        this.sortOrders.push({ field, direction });
        return this;
    }
    setPageSize(size) {
        this.pageSize = size;
        return this;
    }
    setCurrentPage(page) {
        this.currentPage = page;
        return this;
    }
    reset() {
        this.filterGroups = [];
        this.sortOrders = [];
        this.pageSize = undefined;
        this.currentPage = undefined;
        return this;
    }
    build() {
        return {
            filterGroups: this.filterGroups.map((g) => ({ filters: [...g.filters] })),
            sortOrders: this.sortOrders.length ? [...this.sortOrders] : undefined,
            pageSize: this.pageSize,
            currentPage: this.currentPage
        };
    }
}
export const createSearchCriteria = () => new SearchCriteriaBuilder();

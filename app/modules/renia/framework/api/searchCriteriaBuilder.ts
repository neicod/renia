// @env: mixed
import type { Filter, FilterGroup, SearchCriteria } from './searchCriteria';
import type { SortDirection, SortOrder } from './sortOrder';

export class SearchCriteriaBuilder {
  private filterGroups: FilterGroup[] = [];
  private sortOrders: SortOrder[] = [];
  private pageSize?: number;
  private currentPage?: number;

  addFilter(
    field: string,
    value: string | number | boolean,
    conditionType: Filter['conditionType'] = 'eq',
    groupIndex = 0
  ) {
    if (!this.filterGroups[groupIndex]) this.filterGroups[groupIndex] = { filters: [] };
    this.filterGroups[groupIndex].filters.push({ field, value, conditionType });
    return this;
  }

  addFilterGroup(filters: Filter[]) {
    this.filterGroups.push({ filters });
    return this;
  }

  addSort(field: string, direction: SortDirection = 'ASC') {
    this.sortOrders.push({ field, direction });
    return this;
  }

  setPageSize(size: number) {
    this.pageSize = size;
    return this;
  }

  setCurrentPage(page: number) {
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

  build(): SearchCriteria {
    return {
      filterGroups: this.filterGroups.map((g) => ({ filters: [...g.filters] })),
      sortOrders: this.sortOrders.length ? [...this.sortOrders] : undefined,
      pageSize: this.pageSize,
      currentPage: this.currentPage
    };
  }
}

export const createSearchCriteria = (): SearchCriteriaBuilder => new SearchCriteriaBuilder();

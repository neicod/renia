import type { SearchCriteria } from './searchCriteria';
export type SearchResults<T> = {
    items: T[];
    totalCount: number;
    searchCriteria?: SearchCriteria;
};
//# sourceMappingURL=searchResults.d.ts.map
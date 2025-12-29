export type SortDirection = 'ASC' | 'DESC';
export type SortOrder = {
    field: string;
    direction: SortDirection;
};
export declare const sortOrder: (field: string, direction?: SortDirection) => SortOrder;
//# sourceMappingURL=sortOrder.d.ts.map
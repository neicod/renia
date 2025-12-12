// @env: mixed

export type SortDirection = 'ASC' | 'DESC';

export type SortOrder = {
  field: string;
  direction: SortDirection;
};

export const sortOrder = (field: string, direction: SortDirection = 'ASC'): SortOrder => ({
  field,
  direction
});

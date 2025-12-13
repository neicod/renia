// @env: mixed
import type { SearchCriteria } from '@framework/api';

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

const mapCondition = (condition?: string): string => {
  const normalized = typeof condition === 'string' ? condition.toLowerCase() : 'eq';
  return allowedConditions.has(normalized) ? normalized : 'eq';
};

export const buildFilterInput = (
  criteria: SearchCriteria
): Record<string, any> | undefined => {
  const filterGroups = criteria.filterGroups ?? [];
  const filter: Record<string, any> = {};

  filterGroups.forEach((group) => {
    (group.filters ?? []).forEach((f) => {
      const condition = mapCondition(f.conditionType);
      filter[f.field] = { [condition]: f.value };
    });
  });

  return Object.keys(filter).length ? filter : undefined;
};

export const buildSortInput = (criteria: SearchCriteria): Record<string, any> | undefined => {
  if (!criteria.sortOrders || !criteria.sortOrders.length) return undefined;
  const sort: Record<string, any> = {};
  criteria.sortOrders.forEach((s) => {
    sort[s.field] = s.direction === 'DESC' ? 'DESC' : 'ASC';
  });
  return Object.keys(sort).length ? sort : undefined;
};

export default {
  buildFilterInput,
  buildSortInput
};

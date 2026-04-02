import type { GetItemsParams } from '../types/api';
import type { FiltersState } from '../store/filtersSlice';

export function filtersToGetItemsParams(filters: FiltersState): GetItemsParams {
  const params: GetItemsParams = {
    limit: filters.pageSize,
    skip: (filters.page - 1) * filters.pageSize,
    sortColumn: filters.sortColumn,
    sortDirection: filters.sortDirection,
  };

  if (filters.q) {
    params.q = filters.q;
  }

  // ✅ ИСПРАВЛЕНО: categories должен быть строкой с категориями через запятую
  if (filters.categories && filters.categories.length > 0) {
    params.categories = filters.categories.join(',');
  }

  if (filters.needsRevision) {
    params.needsRevision = true;
  }

  return params;
}

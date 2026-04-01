import type { GetItemsParams } from '../types/api';
import type { FiltersState } from '../store/filtersSlice';

export function filtersToGetItemsParams(state: FiltersState): GetItemsParams {
  const skip = (state.page - 1) * state.pageSize;
  const params: GetItemsParams = {
    limit: state.pageSize,
    skip,
    sortColumn: state.sortColumn,
    sortDirection: state.sortDirection,
  };
  const trimmed = state.q.trim();
  if (trimmed) params.q = trimmed;
  if (state.categories.length > 0) {
    params.categories = state.categories.join(',');
  }
  if (state.needsRevision) {
    params.needsRevision = true;
  }
  return params;
}

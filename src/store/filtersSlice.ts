import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Category, Item } from '../types/api';

export type SortColumn = 'title' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export interface FiltersState {
  q: string;
  categories: Category[];
  needsRevision: boolean;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
  allItems: Item[] | null;
  isAllItemsLoaded: boolean;
}

const initialState: FiltersState = {
  q: '',
  categories: [],
  needsRevision: false,
  sortColumn: 'createdAt',
  sortDirection: 'desc',
  page: 1,
  pageSize: 10,
  allItems: null,
  isAllItemsLoaded: false,
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setQ(state, action: PayloadAction<string>) {
      state.q = action.payload;
      state.page = 1;
    },
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
      state.page = 1;
    },
    toggleCategory(state, action: PayloadAction<Category>) {
      const c = action.payload;
      if (state.categories.includes(c)) {
        state.categories = state.categories.filter((x) => x !== c);
      } else {
        state.categories = [...state.categories, c];
      }
      state.page = 1;
    },
    setNeedsRevision(state, action: PayloadAction<boolean>) {
      state.needsRevision = action.payload;
      state.page = 1;
    },
    setSort(
      state,
      action: PayloadAction<{ sortColumn: SortColumn; sortDirection: SortDirection }>
    ) {
      state.sortColumn = action.payload.sortColumn;
      state.sortDirection = action.payload.sortDirection;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
      state.page = 1;
    },
    resetFilters() {
      return { ...initialState, allItems: null, isAllItemsLoaded: false };
    },
    setAllItems(state, action: PayloadAction<Item[]>) {
      state.allItems = action.payload;
      state.isAllItemsLoaded = true;
    },
    clearAllItemsCache(state) {
      state.allItems = null;
      state.isAllItemsLoaded = false;
    },
  },
});

export const {
  setQ,
  setCategories,
  toggleCategory,
  setNeedsRevision,
  setSort,
  setPage,
  setPageSize,
  resetFilters,
  setAllItems,
  clearAllItemsCache,
} = filtersSlice.actions;

export const filtersReducer = filtersSlice.reducer;
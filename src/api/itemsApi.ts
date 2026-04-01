import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { GetItemsParams, Item, ItemsResponse, ListItem, UpdateItemPayload } from '../types/api';

const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api';

function toQueryParams(params: GetItemsParams): Record<string, string | number | boolean> {
  const q: Record<string, string | number | boolean> = {};
  if (params.q !== undefined && params.q !== '') q.q = params.q;
  if (params.limit !== undefined) q.limit = params.limit;
  if (params.skip !== undefined) q.skip = params.skip;
  if (params.categories !== undefined && params.categories !== '') {
    q.categories = params.categories;
  }
  if (params.needsRevision !== undefined) q.needsRevision = params.needsRevision;
  if (params.sortColumn !== undefined) q.sortColumn = params.sortColumn;
  if (params.sortDirection !== undefined) q.sortDirection = params.sortDirection;
  return q;
}

type RawListItem = ListItem;

type RawItem = Omit<Item, 'id'> & {
  id: string | number;
};

type RawItemsResponse = {
  items?: RawListItem[];
  total?: number;
};

type FetchWithBaseQuery = (arg: string | { url: string; params?: Record<string, unknown>; method?: string; body?: unknown }) => any;

const titleToIdCache = new Map<string, string>();
let scanPromise: Promise<void> | null = null;
let knownTotal = 0;
let nextIdToProbe = 1;

function normalizeItem(raw: RawItem): Item {
  return {
    ...raw,
    id: String(raw.id),
  };
}

function isNumericId(value: string): boolean {
  return /^\d+$/.test(value);
}

async function resolveNumericId(
  idOrTitle: string,
  fetchWithBQ: FetchWithBaseQuery,
): Promise<string | null> {
  if (isNumericId(idOrTitle)) return idOrTitle;

  const targetTitle = decodeURIComponent(idOrTitle);
  if (titleToIdCache.has(targetTitle)) return titleToIdCache.get(targetTitle) ?? null;

  await scanUntilTitle(targetTitle, fetchWithBQ);
  return titleToIdCache.get(targetTitle) ?? null;
}

async function ensureTotal(fetchWithBQ: FetchWithBaseQuery): Promise<void> {
  if (knownTotal > 0) return;
  const listResp = await fetchWithBQ({ url: '/items', params: { limit: 1, skip: 0 } });
  if (!listResp.data || typeof listResp.data !== 'object') return;
  const total = Number((listResp.data as RawItemsResponse).total ?? 0);
  if (Number.isFinite(total) && total > 0) knownTotal = total;
}

async function scanUntilTitle(targetTitle: string, fetchWithBQ: FetchWithBaseQuery): Promise<void> {
  await ensureTotal(fetchWithBQ);
  if (knownTotal <= 0) return;
  if (titleToIdCache.has(targetTitle)) return;
  if (nextIdToProbe > knownTotal) return;

  if (!scanPromise) {
    scanPromise = (async () => {
      while (nextIdToProbe <= knownTotal) {
        const candidate = nextIdToProbe;
        nextIdToProbe += 1;

        const resp = await fetchWithBQ(`/items/${candidate}`);
        if (!resp.data || typeof resp.data !== 'object') continue;

        const item = resp.data as RawItem;
        if (typeof item.title === 'string' && item.title.length > 0 && !titleToIdCache.has(item.title)) {
          titleToIdCache.set(item.title, String(candidate));
        }
      }
    })().finally(() => {
      scanPromise = null;
    });
  }

  while (nextIdToProbe <= knownTotal && !titleToIdCache.has(targetTitle)) {
    if (!scanPromise) break;
    await scanPromise;
    if (titleToIdCache.has(targetTitle)) break;
  }

}

export const itemsApi = createApi({
  reducerPath: 'itemsApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Item', 'ItemsList'],
  endpoints: (builder) => ({
    getItems: builder.query<ItemsResponse, GetItemsParams>({
      queryFn: async (params, _api, _extraOptions, fetchWithBQ) => {
        const response = await fetchWithBQ({
          url: '/items',
          params: toQueryParams(params),
        });
        if (response.error) return { error: response.error };

        const raw = (response.data as RawItemsResponse) ?? {};
        const items = raw.items ?? [];
        return {
          data: {
            items,
            total: raw.total ?? items.length,
          },
        };
      },
      providesTags: [{ type: 'ItemsList' as const, id: 'LIST' }],
    }),
    getItem: builder.query<Item, string>({
      queryFn: async (idOrTitle, _api, _extraOptions, fetchWithBQ) => {
        const resolvedId = await resolveNumericId(idOrTitle, fetchWithBQ);
        if (!resolvedId) {
          return { error: { status: 404, data: 'Item not found' } };
        }

        const response = await fetchWithBQ(`/items/${encodeURIComponent(resolvedId)}`);
        if (response.error) return { error: response.error };
        return { data: normalizeItem(response.data as RawItem) };
      },
      providesTags: (_result, _err, id) => [{ type: 'Item' as const, id }],
    }),
    updateItem: builder.mutation<Item, { id: string; body: UpdateItemPayload }>({
      queryFn: async ({ id: idOrTitle, body }, _api, _extraOptions, fetchWithBQ) => {
        const resolvedId = await resolveNumericId(idOrTitle, fetchWithBQ);
        if (!resolvedId) {
          return { error: { status: 404, data: 'Item not found' } };
        }

        const response = await fetchWithBQ({
          url: `/items/${encodeURIComponent(resolvedId)}`,
          method: 'PUT',
          body,
        });
        if (response.error) return { error: response.error };
        return { data: normalizeItem(response.data as RawItem) };
      },
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Item' as const, id },
        { type: 'ItemsList' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetItemsQuery, useGetItemQuery, useUpdateItemMutation } = itemsApi;

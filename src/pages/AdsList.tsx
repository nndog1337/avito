import { Container, Stack, Flex, Group, Pagination } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useGetItemsQuery } from '../api/itemsApi';
import { FiltersPanel } from '../components/common/FiltersPanel';
import { SearchInput } from '../components/common/SearchInput';
import { useAppDispatch, useAppSelector } from '../store';
import { setPage, setSort, setQ, type SortColumn, type SortDirection } from '../store/filtersSlice';
import { filtersToGetItemsParams } from '../utils/filtersToQuery';
import { useDebounce } from '../hooks/useDebounce';
import { PageHeader } from '../components/adsList/PageHeader';
import { SortSelect } from '../components/adsList/SortSelect';
import { ContentState } from '../components/adsList/ContentState';
import { AdsGrid } from '../components/adsList/AdsGrid';

export default function AdsList() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.q);
  const debouncedSearch = useDebounce(localSearchQuery, 500);
  
  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      dispatch(setQ(debouncedSearch));
    }
  }, [debouncedSearch, dispatch, filters.q]);
  
  const queryParams = useMemo(() => filtersToGetItemsParams(filters), [filters]);
  const { data, isLoading, isFetching, isError, error } = useGetItemsQuery(queryParams);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / filters.pageSize)) : 1;

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
  };

  const handleSortChange = (value: string | null) => {
    if (!value) return;
    const [col, dir] = value.split(':') as [SortColumn, SortDirection];
    dispatch(setSort({ sortColumn: col, sortDirection: dir }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };

  return (
    <Container style={{ maxWidth: 1368 }}>
      <Stack gap="lg">
        <PageHeader total={data?.total ?? 0} isFetching={isFetching} />

        <Flex w="100%" gap="md" wrap="wrap">
          <div style={{ flex: 1, minWidth: 280 }}>
            <SearchInput value={localSearchQuery} onChange={handleSearchChange} />
          </div>
          <SortSelect 
            value={`${filters.sortColumn}:${filters.sortDirection}`} 
            onChange={handleSortChange} 
          />
        </Flex>

        <Flex gap="lg" align="flex-start" wrap="wrap">
          <FiltersPanel />
          
          <Stack gap="md" style={{ flex: 1, minWidth: 280 }}>
            <ContentState
              isLoading={isLoading}
              isFetching={isFetching}
              isError={isError}
              error={error}
              isEmpty={data?.items.length === 0}
            >
              <>
                <AdsGrid items={data?.items ?? []} />
                
                {data && data.total > 0 && (
                  <Group justify="center" mt="md">
                    <Pagination
                      total={totalPages}
                      value={filters.page}
                      onChange={handlePageChange}
                      withEdges
                    />
                  </Group>
                )}
              </>
            </ContentState>
          </Stack>
        </Flex>
      </Stack>
    </Container>
  );
}
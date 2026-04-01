import { Alert, Box, Container, Flex, Group, Pagination, Select, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useGetItemsQuery } from '../api/itemsApi';
import { AdCard } from '../components/AdCard';
import { FiltersPanel } from '../components/FiltersPanel';
import { SearchInput } from '../components/SearchInput';
import { useAppDispatch, useAppSelector } from '../store';
import { setPage, setSort, type SortColumn, type SortDirection } from '../store/filtersSlice';
import { filtersToGetItemsParams } from '../utils/filtersToQuery';

export default function AdsList() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  const queryParams = useMemo(() => filtersToGetItemsParams(filters), [filters]);
  const { data, isLoading, isFetching, isError, error } = useGetItemsQuery(queryParams);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / filters.pageSize)) : 1;

  return (
    <Container style={{ maxWidth: 1368 }}>
      <Stack gap="lg">
        <div style={{ width: '100%' }}>
          <Group gap="xs" align="baseline">
            <Flex direction="column" gap="xs">
              <Title order={1}>Мои объявления</Title>
              {data && !isFetching ? (
                <Text size="md" c="dimmed" fw={400}>
                  {data.total} объявлений
                </Text>
              ) : (
                <Text size="md" c="dimmed" fw={400}>
                  Загрузка
                </Text>
              )}
            </Flex>
          </Group>
        </div>

        <Flex w="100%" gap="md" align="center" wrap="wrap">
          <div style={{ flex: 1, minWidth: 280 }}>
            <SearchInput />
          </div>
          <Select
            value={`${filters.sortColumn}:${filters.sortDirection}`}
            onChange={(v) => {
              if (!v) return;
              const [col, dir] = v.split(':') as [SortColumn, SortDirection];
              dispatch(setSort({ sortColumn: col, sortDirection: dir }));
            }}
            size="md"
            data={[
              { value: 'createdAt:desc', label: 'По новизне (сначала новые)' },
              { value: 'createdAt:asc', label: 'По новизне (сначала старые)' },
              { value: 'title:asc', label: 'По названию (А–Я)' },
              { value: 'title:desc', label: 'По названию (Я–А)' },
            ]}
            placeholder="Сортировка"
            w={280}
            h={32}
          />
        </Flex>

        <Flex gap="lg" align="flex-start" wrap="wrap">
          <FiltersPanel />
          <Stack gap="md" style={{ flex: 1, minWidth: 280 }}>
            {isFetching && (
              <Text size="sm" c="dimmed">
                {isLoading ? 'Загрузка...' : 'Поиск...'}
              </Text>
            )}
            {isError && (
              <Alert
                icon={<IconAlertCircle />}
                title="Не удалось загрузить объявления"
                color="red"
                variant="light"
              >
                {error && 'status' in error
                  ? `Ошибка ${error.status}`
                  : 'Проверьте, что бэкенд запущен и переменная VITE_API_BASE_URL указывает на API.'}
              </Alert>
            )}

            {!isFetching && !isError && (
              <>
                {data && data.items.length === 0 ? (
                  <Text c="dimmed">Ничего не найдено. Измените фильтры или запрос.</Text>
                ) : (
                  <>
                    <Flex
                      gap={14}
                      wrap="wrap"
                      align="stretch"
                    >
                      {data?.items.map((item, index) => (
                        <Box key={`${item.category}-${item.title}-${index}`} style={{ flex: '0 0 auto', minWidth: 200 }}>
                          <AdCard item={item} />
                        </Box>
                      ))}
                    </Flex>
                    {data && (
                      <Group justify="center" mt="md">
                        <Pagination
                          total={totalPages}
                          value={filters.page}
                          onChange={(p) => dispatch(setPage(p))}
                          withEdges
                        />
                      </Group>
                    )}
                  </>
                )}
              </>
            )}
          </Stack>
        </Flex>
      </Stack>
    </Container>
  );
}
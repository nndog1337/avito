import { Button, Checkbox, Divider, Flex, Paper, Stack, Switch, Text, Title } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setNeedsRevision,
  resetFilters,
  toggleCategory,
} from '../store/filtersSlice';
import type { Category } from '../types/api';

const categoryOptions: { value: Category; label: string }[] = [
  { value: 'auto', label: 'Авто' },
  { value: 'electronics', label: 'Электроника' },
  { value: 'real_estate', label: 'Недвижимость' },
];

export function FiltersPanel() {
  const dispatch = useAppDispatch();
  const { categories, needsRevision } = useAppSelector((s) => s.filters);

  return (
    <Paper withBorder p="md" radius="md" w={256} style={{ flexShrink: 0 }}>
      <Stack gap="md">
        <Title order={5}>Фильтры</Title>
        <div>
          <Text size="sm" fw={500} mb="xs">
            Категории
          </Text>
          <Stack gap="xs">
            {categoryOptions.map((opt) => (
              <Checkbox
                key={opt.value}
                label={opt.label}
                checked={categories.includes(opt.value)}
                onChange={() => dispatch(toggleCategory(opt.value))}
              />
            ))}
          </Stack>
        </div>
        <Divider />
        <div>
          <Flex align="center" justify="space-between" gap="sm">
            <Text size="sm" fw={500}>
              Только требующие доработок
            </Text>
            <Switch
              aria-label="Требует доработки"
              checked={needsRevision}
              onChange={(e) => dispatch(setNeedsRevision(e.currentTarget.checked))}
            />
          </Flex>
        </div>
        <Divider />
        <Button variant="light" color="gray" fullWidth onClick={() => dispatch(resetFilters())}>
          Сбросить фильтры
        </Button>
      </Stack>
    </Paper>
  );
}

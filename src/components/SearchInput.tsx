import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../store';
import { setQ } from '../store/filtersSlice';

export function SearchInput() {
  const dispatch = useAppDispatch();
  const q = useAppSelector((s) => s.filters.q);

  return (
    <TextInput
      placeholder="Поиск по названию..."
      rightSection={<IconSearch size={18} />}
      rightSectionPointerEvents="none"
      value={q}
      onChange={(e) => dispatch(setQ(e.currentTarget.value))}
      size="md"
      style={{ width: '100%', height: '32px' }}
    />
  );
}

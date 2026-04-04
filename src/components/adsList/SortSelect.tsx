import { Select } from '@mantine/core';

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const sortOptions = [
  { value: 'createdAt:desc', label: 'По новизне (сначала новые)' },
  { value: 'createdAt:asc', label: 'По новизне (сначала старые)' },
  { value: 'title:asc', label: 'По названию (А–Я)' },
  { value: 'title:desc', label: 'По названию (Я–А)' },
];

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <Select
      value={value}
      onChange={(val) => {
        if (val) onChange(val);
      }}
      size="md"
      data={sortOptions}
      placeholder="Сортировка"
      w={280}
    />
  );
}
import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Поиск по названию..." }: SearchInputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      rightSection={<IconSearch size={18} />}
      rightSectionPointerEvents="none"
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      size="md"
      style={{ width: '100%', height: '32px' }}
    />
  );
}
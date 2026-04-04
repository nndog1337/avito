import { Flex, Title, Text } from '@mantine/core';

interface PageHeaderProps {
  total: number;
  isFetching: boolean;
}

export function PageHeader({ total, isFetching }: PageHeaderProps) {
  return (
    <Flex direction="column" gap="xs">
      <Title order={1}>Мои объявления</Title>
      {total && !isFetching ? (
        <Text size="md" c="dimmed" fw={400}>
          {total} объявлений
        </Text>
      ) : (
        <Text size="md" c="dimmed" fw={400}>
          Загрузка
        </Text>
      )}
    </Flex>
  );
}
import { Alert, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface ContentStateProps {
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error?: unknown;
  isEmpty: boolean;
  children: React.ReactNode;
}

function hasStatus(error: unknown): error is { status: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
  );
}

export function ContentState({ isLoading, isFetching, isError, error, isEmpty, children }: ContentStateProps) {
  if (isFetching) {
    return (
      <Text size="sm" c="dimmed">
        {isLoading ? 'Загрузка...' : 'Поиск...'}
      </Text>
    );
  }

  if (isError) {
    return (
      <Alert
        icon={<IconAlertCircle />}
        title="Не удалось загрузить объявления"
        color="red"
        variant="light"
      >
        {hasStatus(error)
          ? `Ошибка ${error.status}`
          : 'Проверьте, что бэкенд запущен и переменная VITE_API_BASE_URL указывает на API.'}
      </Alert>
    );
  }

  if (isEmpty) {
    return <Text c="dimmed">Ничего не найдено. Измените фильтры или запрос.</Text>;
  }

  return <>{children}</>;
}
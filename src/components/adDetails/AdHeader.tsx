import { Box, Flex, Title, Text, Button } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { formatPrice, formatDate } from '../../utils/formatters';
import type { Item } from '../../types/api';

interface AdHeaderProps {
  item: Item;
}

export function AdHeader({ item }: AdHeaderProps) {
  return (
    <Box>
      <Flex justify="space-between">
        <Title order={2} size={28}>{item.title}</Title>
        <Text size="xl" fw={700} c="var(--mantine-color-text)" style={{ fontSize: '28px' }}>
          {formatPrice(item.price)}
        </Text>
      </Flex>
      <Flex justify="space-between" align="center">
        <Button
          component={Link}
          to={`/ads/${item.id}/edit`}
          rightSection={<IconPencil size={18} />}
          variant="blue"
          w={170}
          style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
        >
          Редактировать
        </Button>
        <Flex direction="column" style={{ textAlign: 'right' }}>
          <Text c="dimmed" size="sm" mt={4}>
            Опубликовано: {formatDate(item.createdAt)}
          </Text>
          {item.updatedAt && (
            <Text c="dimmed" size="sm" mt={4}>
              Отредактировано: {formatDate(item.updatedAt)}
            </Text>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
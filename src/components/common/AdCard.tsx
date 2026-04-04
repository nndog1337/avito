import { Card, Image, Text, Badge, Group, Flex, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import type { ListItem } from '../../types/api';

interface AdCardProps {
  item: ListItem;
}

const categoryLabels: Record<string, string> = {
  auto: 'Авто',
  electronics: 'Электроника',
  real_estate: 'Недвижимость',
};


export function AdCard({ item }: AdCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/ads/${item.id}`);
  };

  return (
    <Card
      shadow="sm"
      padding={0}
      radius="md"
      withBorder
      onClick={handleClick}
      style={{ cursor: 'pointer', overflow: 'hidden', height: '310px', width: '200px' }}
    >
      <Card.Section>
        <Image
          src={'https://placehold.co/400x250?text=Нет+фото'}
          height={150}
          alt={item.title}
          fit="cover"
        />
      </Card.Section>

      <Box p="md">
        <Group justify="space-between" mb="xs">
          <Badge color={'gray'} variant="light" size="sm" style={{ border: '1px solid #e0e0e0' }}>
            {categoryLabels[item.category]}
          </Badge>
        </Group>
        <Flex direction={'column'} h={80}>
          <Text fw={600} size="sm" lineClamp={2} mb="xs">
            {item.title}
          </Text>
          <Text fw={700} size="sm" c="gray" style={{marginTop: 'auto'}}>
            {item.price.toLocaleString()} ₽
          </Text>
        </Flex>
        {item.needsRevision && (
            <Badge color="yellow" variant="filled" size="sm">
              Требует доработок
            </Badge>
          )}
      </Box>
    </Card>
  );
}
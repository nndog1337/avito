import {
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Title,
  Box,
  Flex,
  Alert,
  Image,
} from '@mantine/core';
import { IconArrowLeft, IconPencil, IconAlertCircle } from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import { useGetItemQuery } from '../api/itemsApi';
import type { AutoParams, ElectronicsParams, Item, RealEstateParams } from '../types/api';



function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function getMissingFields(item: Item): string[] {
  const missing: string[] = [];
  
  if (!item.description) {
    missing.push('Описание');
  }
  
  if (item.category === 'electronics') {
    const params = item.params as ElectronicsParams;
    if (!params.color) missing.push('Цвет');
    if (!params.condition) missing.push('Состояние');
    if (!params.brand) missing.push('Бренд');
    if (!params.model) missing.push('Модель');
  } else if (item.category === 'auto') {
    const params = item.params as AutoParams;
    if (!params.brand) missing.push('Марка');
    if (!params.model) missing.push('Модель');
    if (!params.yearOfManufacture) missing.push('Год выпуска');
    if (!params.mileage) missing.push('Пробег');
  } else if (item.category === 'real_estate') {
    const params = item.params as RealEstateParams;
    if (!params.type) missing.push('Тип недвижимости');
    if (!params.area) missing.push('Площадь');
    if (!params.address) missing.push('Адрес');
  }
  
  return missing;
}

function ParamsTable({ item }: { item: Item }) {
  let rows: { label: string; value: string }[] = [];

  if (item.category === 'auto') {
    const p = item.params as AutoParams;
    rows = [
      { label: 'Тип', value: 'Автомобиль' },
      ...(p.brand ? [{ label: 'Бренд', value: p.brand }] : []),
      ...(p.model ? [{ label: 'Модель', value: p.model }] : []),
      ...(p.yearOfManufacture ? [{ label: 'Год', value: String(p.yearOfManufacture) }] : []),
      ...(p.transmission ? [{ label: 'КПП', value: p.transmission === 'automatic' ? 'Автомат' : 'Механика' }] : []),
      ...(p.mileage ? [{ label: 'Пробег', value: `${p.mileage.toLocaleString('ru-RU')} км` }] : []),
      ...(p.enginePower ? [{ label: 'Мощность', value: `${p.enginePower} л.с.` }] : []),
    ];
  } else if (item.category === 'real_estate') {
    const p = item.params as RealEstateParams;
    const typeLabel = p.type === 'flat' ? 'Квартира' : p.type === 'house' ? 'Дом' : p.type === 'room' ? 'Комната' : '';
    rows = [
      { label: 'Тип', value: typeLabel || 'Недвижимость' },
      ...(p.address ? [{ label: 'Адрес', value: p.address }] : []),
      ...(p.area ? [{ label: 'Площадь', value: `${p.area} м²` }] : []),
      ...(p.floor ? [{ label: 'Этаж', value: String(p.floor) }] : []),
    ];
  } else {
    const p = item.params as ElectronicsParams;
    const typeLabel = p.type === 'phone' ? 'Телефон' : p.type === 'laptop' ? 'Ноутбук' : p.type === 'misc' ? 'Другое' : '';
    rows = [
      { label: 'Тип', value: typeLabel || 'Электроника' },
      ...(p.brand ? [{ label: 'Бренд', value: p.brand }] : []),
      ...(p.model ? [{ label: 'Модель', value: p.model }] : []),
      ...(p.color ? [{ label: 'Цвет', value: p.color }] : []),
      ...(p.condition ? [{ label: 'Состояние', value: p.condition === 'new' ? 'Новое' : 'Б/у' }] : []),
    ];
  }

  return (
    <Table variant="vertical" layout="fixed" withTableBorder>
      <Table.Tbody>
        {rows.map((row) => (
          <Table.Tr key={row.label}>
            <Table.Th style={{ width: 120, backgroundColor: '#f8f9fa' }}>{row.label}</Table.Th>
            <Table.Td>{row.value}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

export default function AdDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading, isError, error } = useGetItemQuery(id ?? '', {
    skip: !id,
  });

  if (!id) {
    return (
      <Container py="lg">
        <Text>Некорректный идентификатор</Text>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container py="lg">
        <Text>Загрузка…</Text>
      </Container>
    );
  }

  if (isError || !item) {
    return (
      <Container py="lg">
        <Stack gap="md">
          <Text c="red">
            {error && 'status' in error ? `Ошибка ${error.status}` : 'Объявление не найдено'}
          </Text>
          <Button component={Link} to="/ads" leftSection={<IconArrowLeft size={18} />} variant="light">
            К списку
          </Button>
        </Stack>
      </Container>
    );
  }

  const missingFields = getMissingFields(item);

  return (
    <Container size="md" py="lg">
      <Stack gap="xl">
        <div>
          <Group justify="space-between" align="flex-start" mt="md" wrap="wrap">
            <Box style={{ flex: 1 }}>
              <Flex justify={'space-between'}>
                <Title order={2} size={28}>{item.title}</Title>
                <Text size="xl" fw={700} c="black" style={{fontSize:'28px'}}>
                    {formatPrice(item.price)}
                  </Text>
              </Flex>
              <Flex justify={'space-between'}>
                  <Button
                  component={Link}
                  to={`/ads/${item.id}/edit`}
                  leftSection={<IconPencil size={18} />}
                  variant="light"
                  w={170}
                >
                  Редактировать
                </Button>
                <Flex direction="column">
                    <Text c="dimmed" size="sm" mt={4}>
                      Опубликовано: {formatDate(item.createdAt)}
                      {item.updatedAt && (
                        <Text> Отредактировано: {formatDate(item.updatedAt)}</Text>
                      )}
                    </Text>
                  </Flex>
                </Flex>
            </Box>
          </Group>
        </div>

        <Flex gap={32}>
          <Image
            src={'https://placehold.co/400x250?text=Нет+фото'}
            height={'360px'}
            alt={item.title}
            fit="cover"
            style={{width:'480px'}}
          />
          <Flex direction="column">
            {missingFields.length > 0 && (
            <Alert
              color="yellow"
              icon={<IconAlertCircle size={18} />}
              title="Требуются доработки"
              variant="light"
            >
              <Text size="sm" fw={500} mb="xs">
                У объявления не заполнены поля:
              </Text>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {missingFields.map((field) => (
                  <li key={field}>
                    <Text size="sm">{field}</Text>
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          <Box>
            <Title order={4} mb="sm">
              Характеристики
            </Title>
            <Divider mb="md" />
            <ParamsTable item={item} />
          </Box>
          </Flex>
        </Flex>

        {item.description && (
          <Box>
            <Title order={4} mb="sm">
              Описание
            </Title>
            <Divider mb="md" />
            <Paper withBorder p="md" radius="md" bg="gray.0">
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {item.description}
              </Text>
            </Paper>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
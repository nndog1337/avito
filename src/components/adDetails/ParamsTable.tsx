import { Stack, Group, Text } from '@mantine/core';
import type { AutoParams, ElectronicsParams, Item, RealEstateParams } from '../../types/api';

interface ParamsTableProps {
  item: Item;
}

export function ParamsTable({ item }: ParamsTableProps) {
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
    <Stack gap="sm">
      {rows.map((row) => (
        <Group key={row.label} wrap="nowrap">
          <Text fw={500} size="sm" c="dimmed" style={{ minWidth: 120 }}>
            {row.label}:
          </Text>
          <Text size="sm" style={{ textAlign: 'right' }}>
            {row.value}
          </Text>
        </Group>
      ))}
    </Stack>
  );
}
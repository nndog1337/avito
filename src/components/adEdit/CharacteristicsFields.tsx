import { Stack, TextInput, NumberInput, Select } from '@mantine/core';
import { FormValues } from '../../types/form';
import { UseFormReturnType } from '@mantine/form';

interface CharacteristicsFieldsProps {
  category: string;
  form: UseFormReturnType<FormValues>;
}

export function CharacteristicsFields({ category, form }: CharacteristicsFieldsProps) {
  if (category === 'auto') {
    return (
      <Stack gap="sm">
        <TextInput label="Марка" {...form.getInputProps('auto.brand')} style={{ width: 456 }} />
        <TextInput label="Модель" {...form.getInputProps('auto.model')} style={{ width: 456 }} />
        <NumberInput label="Год выпуска" min={1900} max={2100} {...form.getInputProps('auto.yearOfManufacture')} style={{ width: 456 }} />
        <Select
          label="Тип КПП"
          clearable
          data={[
            { value: 'automatic', label: 'Автомат' },
            { value: 'manual', label: 'Механика' },
          ]}
          {...form.getInputProps('auto.transmission')}
          error={form.errors['auto.transmission']}
          style={{ width: 456 }}
        />
        <NumberInput label="Пробег, км" min={0} {...form.getInputProps('auto.mileage')} style={{ width: 456 }} />
        <NumberInput label="Мощность, л.с." min={0} {...form.getInputProps('auto.enginePower')} style={{ width: 456 }} />
      </Stack>
    );
  }

  if (category === 'real_estate') {
    return (
      <Stack gap="sm">
        <Select
          label="Тип недвижимости"
          required
          clearable
          data={[
            { value: 'flat', label: 'Квартира' },
            { value: 'house', label: 'Дом' },
            { value: 'room', label: 'Комната' },
          ]}
          {...form.getInputProps('realEstate.type')}
          error={form.errors['realEstate.type']}
          style={{ width: 456 }}
        />
        <TextInput label="Адрес" {...form.getInputProps('realEstate.address')} style={{ width: 456 }} />
        <NumberInput label="Площадь, м²" min={0} {...form.getInputProps('realEstate.area')} style={{ width: 456 }} />
        <NumberInput label="Этаж" {...form.getInputProps('realEstate.floor')} style={{ width: 456 }} />
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <Select
        label="Тип устройства"
        required
        clearable
        data={[
          { value: 'phone', label: 'Телефон' },
          { value: 'laptop', label: 'Ноутбук' },
          { value: 'misc', label: 'Другое' },
        ]}
        {...form.getInputProps('electronics.type')}
        error={form.errors['electronics.type']}
        style={{ width: 456 }}
      />
      <TextInput label="Бренд" {...form.getInputProps('electronics.brand')} style={{ width: 456 }} />
      <TextInput label="Модель" {...form.getInputProps('electronics.model')} style={{ width: 456 }} />
      <TextInput label="Цвет" {...form.getInputProps('electronics.color')} style={{ width: 456 }} />
      <Select
        label="Состояние"
        clearable
        data={[
          { value: 'new', label: 'Новое' },
          { value: 'used', label: 'Б/у' },
        ]}
        {...form.getInputProps('electronics.condition')}
        style={{ width: 456 }}
      />
    </Stack>
  );
}
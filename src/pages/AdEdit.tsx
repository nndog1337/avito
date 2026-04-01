import {
  Alert,
  Button,
  Container,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetItemQuery, useUpdateItemMutation } from '../api/itemsApi';
import type {
  AutoParams,
  Category,
  ElectronicsParams,
  RealEstateParams,
  UpdateItemPayload,
} from '../types/api';

type FormValues = {
  category: Category;
  title: string;
  description: string;
  price: number;
  auto: AutoParams;
  realEstate: RealEstateParams;
  electronics: ElectronicsParams;
};

function buildPayload(values: FormValues): UpdateItemPayload {
  let params: AutoParams | RealEstateParams | ElectronicsParams;
  if (values.category === 'auto') params = { ...values.auto };
  else if (values.category === 'real_estate') params = { ...values.realEstate };
  else params = { ...values.electronics };

  return {
    category: values.category,
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    price: values.price,
    params,
  };
}

export default function AdEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading, isError } = useGetItemQuery(id ?? '', { skip: !id });
  const [updateItem, { isLoading: saving, isError: saveError, error: saveErr }] =
    useUpdateItemMutation();

  const form = useForm<FormValues>({
    initialValues: {
      category: 'auto',
      title: '',
      description: '',
      price: 0,
      auto: {},
      realEstate: {},
      electronics: {},
    },
    validate: {
      title: (v) => (!v.trim() ? 'Укажите название' : null),
      price: (v) => (v < 0 ? 'Цена не может быть отрицательной' : null),
    },
  });

  useEffect(() => {
    if (!item) return;
    form.setValues({
      category: item.category,
      title: item.title,
      description: item.description ?? '',
      price: item.price,
      auto: item.category === 'auto' ? { ...(item.params as AutoParams) } : {},
      realEstate:
        item.category === 'real_estate' ? { ...(item.params as RealEstateParams) } : {},
      electronics:
        item.category === 'electronics' ? { ...(item.params as ElectronicsParams) } : {},
    });
  }, [item]);

  if (!id) {
    return (
      <Container py="lg">
        <Title order={4}>Некорректный идентификатор</Title>
      </Container>
    );
  }

  if (isLoading || !item) {
    return (
      <Container py="lg">
        <Title order={4}>Загрузка…</Title>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container py="lg">
        <Alert color="red" title="Не удалось загрузить объявление">
          Вернитесь к списку и попробуйте снова.
        </Alert>
        <Button component={Link} to="/ads" mt="md" leftSection={<IconArrowLeft size={18} />}>
          К списку
        </Button>
      </Container>
    );
  }

  const handleSubmit = form.onSubmit(async (values) => {
    const body = buildPayload(values);
    try {
      await updateItem({ id, body }).unwrap();
      navigate(`/ads/${id}`);
    } catch (e){
      console.log(e)
    }
  });

  const cat = form.values.category;

  return (
    <Container size="sm" py="lg">
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <Group justify="space-between">
            <Title order={2}>Редактирование</Title>
            <Button
              component={Link}
              to={`/ads/${id}`}
              variant="default"
              leftSection={<IconArrowLeft size={18} />}
            >
              Назад
            </Button>
          </Group>

          {saveError && (
            <Alert color="red" title="Ошибка сохранения">
              {'status' in saveErr ? `Код ${saveErr.status}` : 'Проверьте данные и API.'}
            </Alert>
          )}

          <Select
            label="Категория"
            data={[
              { value: 'auto', label: 'Авто' },
              { value: 'electronics', label: 'Электроника' },
              { value: 'real_estate', label: 'Недвижимость' },
            ]}
            value={form.values.category}
            onChange={(v) => {
              const next = (v as Category) || 'auto';
              form.setFieldValue('category', next);
              form.setFieldValue('auto', {});
              form.setFieldValue('realEstate', {});
              form.setFieldValue('electronics', {});
            }}
          />

          <TextInput label="Название" required {...form.getInputProps('title')} />
          <NumberInput label="Цена, ₽" required min={0} {...form.getInputProps('price')} />
          


          <Text fw={700}>Характеристики</Text>

          {cat === 'auto' && (
            <Stack gap="sm">
              <TextInput
                label="Марка"
                {...form.getInputProps('auto.brand')}
              />
              <TextInput
                label="Модель"
                {...form.getInputProps('auto.model')}
              />
              <NumberInput
                label="Год выпуска"
                min={1900}
                max={2100}
                {...form.getInputProps('auto.yearOfManufacture')}
              />
              <Select
                label="КПП"
                clearable
                data={[
                  { value: 'automatic', label: 'Автомат' },
                  { value: 'manual', label: 'Механика' },
                ]}
                {...form.getInputProps('auto.transmission')}
              />
              <NumberInput
                label="Пробег, км"
                min={0}
                {...form.getInputProps('auto.mileage')}
              />
              <NumberInput
                label="Мощность, л.с."
                min={0}
                {...form.getInputProps('auto.enginePower')}
              />
            </Stack>
          )}

          {cat === 'real_estate' && (
            <Stack gap="sm">
              <Select
                label="Тип"
                clearable
                data={[
                  { value: 'flat', label: 'Квартира' },
                  { value: 'house', label: 'Дом' },
                  { value: 'room', label: 'Комната' },
                ]}
                {...form.getInputProps('realEstate.type')}
              />
              <TextInput label="Адрес" {...form.getInputProps('realEstate.address')} />
              <NumberInput label="Площадь, м²" min={0} {...form.getInputProps('realEstate.area')} />
              <NumberInput label="Этаж" {...form.getInputProps('realEstate.floor')} />
            </Stack>
          )}

          {cat === 'electronics' && (
            <Stack gap="sm">
              <Select
                label="Тип"
                clearable
                data={[
                  { value: 'phone', label: 'Телефон' },
                  { value: 'laptop', label: 'Ноутбук' },
                  { value: 'misc', label: 'Другое' },
                ]}
                {...form.getInputProps('electronics.type')}
              />
              <TextInput label="Бренд" {...form.getInputProps('electronics.brand')} />
              <TextInput label="Модель" {...form.getInputProps('electronics.model')} />
              <TextInput label="Цвет" {...form.getInputProps('electronics.color')} />
              <Select
                label="Состояние"
                clearable
                data={[
                  { value: 'new', label: 'Новое' },
                  { value: 'used', label: 'Б/у' },
                ]}
                {...form.getInputProps('electronics.condition')}
              />
              <Textarea label="Описание" minRows={3} {...form.getInputProps('description')} />
            </Stack>
            
          )}

          <Group justify="flex-end">
            <Button type="submit" leftSection={<IconDeviceFloppy size={18} />} loading={saving}>
              Сохранить
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}

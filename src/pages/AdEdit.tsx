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
  ActionIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconX } from '@tabler/icons-react';
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

const DRAFT_KEY = 'adEditDraft';

function buildPayload(values: FormValues): UpdateItemPayload {
  let params: AutoParams | RealEstateParams | ElectronicsParams;
  
  if (values.category === 'auto') {
    const p = values.auto;
    const autoParams: AutoParams = {};
    if (p.brand?.trim()) autoParams.brand = p.brand.trim();
    if (p.model?.trim()) autoParams.model = p.model.trim();
    if (p.yearOfManufacture && p.yearOfManufacture > 0) autoParams.yearOfManufacture = p.yearOfManufacture;
    if (p.transmission) autoParams.transmission = p.transmission;
    if (p.mileage && p.mileage > 0) autoParams.mileage = p.mileage;
    if (p.enginePower && p.enginePower > 0) autoParams.enginePower = p.enginePower;
    params = autoParams;
  } else if (values.category === 'real_estate') {
    const p = values.realEstate;
    const realEstateParams: RealEstateParams = {};
    if (p.type) realEstateParams.type = p.type;
    if (p.address?.trim()) realEstateParams.address = p.address.trim();
    if (p.area && p.area > 0) realEstateParams.area = p.area;
    if (p.floor && p.floor > 0) realEstateParams.floor = p.floor;
    params = realEstateParams;
  } else {
    const p = values.electronics;
    const electronicsParams: ElectronicsParams = {};
    if (p.type) electronicsParams.type = p.type;
    if (p.brand?.trim()) electronicsParams.brand = p.brand.trim();
    if (p.model?.trim()) electronicsParams.model = p.model.trim();
    if (p.color?.trim()) electronicsParams.color = p.color.trim();
    if (p.condition) electronicsParams.condition = p.condition;
    params = electronicsParams;
  }

  return {
    category: values.category,
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    price: Number(values.price),
    params,
  };
}

function saveDraftToLocalStorage(values: FormValues, id: string) {
  const draft = {
    id,
    values,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadDraftFromLocalStorage(id: string): FormValues | null {
  const stored = localStorage.getItem(DRAFT_KEY);
  if (!stored) return null;
  
  try {
    const draft = JSON.parse(stored);
    if (draft.id === id) {
      return draft.values;
    }
  } catch (e) {
    console.error('Failed to load draft', e);
  }
  return null;
}

// Очистка черновика
function clearDraftFromLocalStorage() {
  localStorage.removeItem(DRAFT_KEY);
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
      auto: {
        brand: '',
        model: '',
        yearOfManufacture: undefined,
        transmission: undefined,
        mileage: undefined,
        enginePower: undefined,
      },
      realEstate: {
        type: undefined,
        address: '',
        area: undefined,
        floor: undefined,
      },
      electronics: {
        type: undefined,
        brand: '',
        model: '',
        color: '',
        condition: undefined,
      },
    },
    validate: {
      title: (v) => (!v.trim() ? 'Укажите название' : null),
      price: (v) => (v < 0 ? 'Цена не может быть отрицательной' : null),
    },
  });

  useEffect(() => {
    if (!item) return;
    
    const draft = loadDraftFromLocalStorage(id!);
    
    if (draft) {
      form.setValues(draft);
    } else {
      form.setValues({
        category: item.category,
        title: item.title,
        description: item.description ?? '',
        price: item.price,
        auto: item.category === 'auto' && item.params ? { ...(item.params as AutoParams) } : {
          brand: '',
          model: '',
          yearOfManufacture: undefined,
          transmission: undefined,
          mileage: undefined,
          enginePower: undefined,
        },
        realEstate: item.category === 'real_estate' && item.params ? { ...(item.params as RealEstateParams) } : {
          type: undefined,
          address: '',
          area: undefined,
          floor: undefined,
        },
        electronics: item.category === 'electronics' && item.params ? { ...(item.params as ElectronicsParams) } : {
          type: undefined,
          brand: '',
          model: '',
          color: '',
          condition: undefined,
        },
      });
    }
  }, [item, id]);

  useEffect(() => {
    if (!id) return;
    if (!form.isDirty()) return;
    
    const timeoutId = setTimeout(() => {
      const currentValues = form.getValues();
      saveDraftToLocalStorage(currentValues, id);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [form.values, id, form.isDirty]);

  const handleCancel = () => {
    clearDraftFromLocalStorage();
    navigate(`/ads/${id}`);
  };

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

  const handleSubmit = form.onSubmit((values) => {
    const body = buildPayload(values);
    updateItem({ id, body })
      .unwrap()
      .then(() => {
        clearDraftFromLocalStorage();
        navigate(`/ads/${id}`);
      })
      .catch((e) => {
        console.log(e);
      });
  });

  const cat = form.values.category;

  return (
    <Container style={{ maxWidth: 1368 }}>
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <Title order={2}>Редактирование</Title>

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
              form.setFieldValue('auto', {
                brand: '',
                model: '',
                yearOfManufacture: undefined,
                transmission: undefined,
                mileage: undefined,
                enginePower: undefined,
              });
              form.setFieldValue('realEstate', {
                type: undefined,
                address: '',
                area: undefined,
                floor: undefined,
              });
              form.setFieldValue('electronics', {
                type: undefined,
                brand: '',
                model: '',
                color: '',
                condition: undefined,
              });
            }}
            style={{ width: 456 }}
          />

          <TextInput
            label="Название"
            required
            {...form.getInputProps('title')}
            style={{ width: 456 }}
            rightSection={
              form.values.title && (
                <ActionIcon
                  onClick={() => form.setFieldValue('title', '')}
                  variant="subtle"
                  size="sm"
                  color="gray"
                >
                  <IconX size={14} />
                </ActionIcon>
              )
            }
          />

          <NumberInput
            label="Цена, ₽"
            required
            min={0}
            {...form.getInputProps('price')}
            style={{ width: 456 }}
          />

          <Text fw={700}>Характеристики</Text>

          {cat === 'auto' && (
            <Stack gap="sm">
              <TextInput 
                label="Марка" 
                value={form.values.auto.brand || ''}
                onChange={(e) => form.setFieldValue('auto.brand', e.currentTarget.value)}
                style={{ width: 456 }}
                rightSection={
                  form.values.auto.brand && (
                    <ActionIcon
                      onClick={() => form.setFieldValue('auto.brand', '')}
                      variant="subtle"
                      size="sm"
                      color="gray"
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  )
                }
              />
              <TextInput 
                label="Модель" 
                value={form.values.auto.model || ''}
                onChange={(e) => form.setFieldValue('auto.model', e.currentTarget.value)}
                style={{ width: 456 }}
                rightSection={
                  form.values.auto.model && (
                    <ActionIcon
                      onClick={() => form.setFieldValue('auto.model', '')}
                      variant="subtle"
                      size="sm"
                      color="gray"
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  )
                }
              />
              <NumberInput
                label="Год выпуска"
                min={1900}
                max={2100}
                {...form.getInputProps('auto.yearOfManufacture')}
                style={{ width: 456 }}
              />
              <Select
                label="КПП"
                clearable
                data={[
                  { value: 'automatic', label: 'Автомат' },
                  { value: 'manual', label: 'Механика' },
                ]}
                value={form.values.auto.transmission || null}
                onChange={(val) => form.setFieldValue('auto.transmission', val as 'automatic' | 'manual' | undefined)}
                style={{ width: 456 }}
              />
              <NumberInput
                label="Пробег, км"
                min={0}
                {...form.getInputProps('auto.mileage')}
                style={{ width: 456 }}
              />
              <NumberInput
                label="Мощность, л.с."
                min={0}
                {...form.getInputProps('auto.enginePower')}
                style={{ width: 456 }}
              />
              <Textarea
                label="Описание"
                minRows={3}
                maxRows={10}
                autosize
                resize="vertical"
                {...form.getInputProps('description')}
                w="100%"
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
                value={form.values.realEstate.type || null}
                onChange={(val) => form.setFieldValue('realEstate.type', val as 'flat' | 'house' | 'room' | undefined)}
                style={{ width: 456 }}
              />
              <TextInput
                label="Адрес"
                value={form.values.realEstate.address || ''}
                onChange={(e) => form.setFieldValue('realEstate.address', e.currentTarget.value)}
                style={{ width: 456 }}
                rightSection={
                  form.values.realEstate.address && (
                    <ActionIcon
                      onClick={() => form.setFieldValue('realEstate.address', '')}
                      variant="subtle"
                      size="sm"
                      color="gray"
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  )
                }
              />
              <NumberInput
                label="Площадь, м²"
                min={0}
                {...form.getInputProps('realEstate.area')}
                style={{ width: 456 }}
              />
              <NumberInput
                label="Этаж"
                {...form.getInputProps('realEstate.floor')}
                style={{ width: 456 }}
              />
              <Textarea
                label="Описание"
                minRows={3}
                maxRows={10}
                autosize
                resize="vertical"
                {...form.getInputProps('description')}
                w="100%"
              />
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
                value={form.values.electronics.type || null}
                onChange={(val) => form.setFieldValue('electronics.type', val as 'phone' | 'laptop' | 'misc' | undefined)}
                style={{ width: 456 }}
              />
              <TextInput
                label="Бренд"
                value={form.values.electronics.brand || ''}
                onChange={(e) => form.setFieldValue('electronics.brand', e.currentTarget.value)}
                style={{ width: 456 }}
                rightSection={
                  form.values.electronics.brand && (
                    <ActionIcon
                      onClick={() => form.setFieldValue('electronics.brand', '')}
                      variant="subtle"
                      size="sm"
                      color="gray"
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  )
                }
              />
              <TextInput
                label="Модель"
                value={form.values.electronics.model || ''}
                onChange={(e) => form.setFieldValue('electronics.model', e.currentTarget.value)}
                style={{ width: 456 }}
                rightSection={
                  form.values.electronics.model && (
                    <ActionIcon
                      onClick={() => form.setFieldValue('electronics.model', '')}
                      variant="subtle"
                      size="sm"
                      color="gray"
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  )
                }
              />
              <TextInput
                label="Цвет"
                value={form.values.electronics.color || ''}
                onChange={(e) => form.setFieldValue('electronics.color', e.currentTarget.value)}
                style={{ width: 456 }}
                rightSection={
                  form.values.electronics.color && (
                    <ActionIcon
                      onClick={() => form.setFieldValue('electronics.color', '')}
                      variant="subtle"
                      size="sm"
                      color="gray"
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  )
                }
              />
              <Select
                label="Состояние"
                clearable
                data={[
                  { value: 'new', label: 'Новое' },
                  { value: 'used', label: 'Б/у' },
                ]}
                value={form.values.electronics.condition || null}
                onChange={(val) => form.setFieldValue('electronics.condition', val as 'new' | 'used' | undefined)}
                style={{ width: 456 }}
              />
              <Textarea
                label="Описание"
                minRows={3}
                maxRows={10}
                autosize
                resize="vertical"
                {...form.getInputProps('description')}
                w="100%"
              />
            </Stack>
          )}

          <Group justify="flex-start" mt="md">
            <Button type="submit" loading={saving}>
              Сохранить
            </Button>
            <Button variant="default" onClick={handleCancel}>
              Отменить
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
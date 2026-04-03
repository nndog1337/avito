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
  Divider,
  Popover,
  Loader,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconX, IconAlertCircle, IconBulb, IconCheck } from '@tabler/icons-react';
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetItemQuery, useUpdateItemMutation } from '../api/itemsApi';
import type {
  AutoParams,
  Category,
  ElectronicsParams,
  RealEstateParams,
  UpdateItemPayload,
} from '../types/api';
import { notifications } from '@mantine/notifications';

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
const AI_API_URL = 'http://localhost:11434/api/generate';
const AI_MODEL = 'llama3.2';

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

function clearDraftFromLocalStorage() {
  localStorage.removeItem(DRAFT_KEY);
}

function generateDescriptionPrompt(values: FormValues): string {
  let paramsText = '';

  if (values.category === 'auto') {
    const p = values.auto;
    paramsText = `
- Марка: ${p.brand || 'не указана'}
- Модель: ${p.model || 'не указана'}
- Год выпуска: ${p.yearOfManufacture || 'не указан'}
- КПП: ${p.transmission === 'automatic' ? 'Автомат' : p.transmission === 'manual' ? 'Механика' : 'не указана'}
- Пробег: ${p.mileage ? `${p.mileage.toLocaleString()} км` : 'не указан'}
- Мощность: ${p.enginePower ? `${p.enginePower} л.с.` : 'не указана'}`;
  } else if (values.category === 'real_estate') {
    const p = values.realEstate;
    const typeLabel = p.type === 'flat' ? 'Квартира' : p.type === 'house' ? 'Дом' : p.type === 'room' ? 'Комната' : 'не указан';
    paramsText = `
- Тип: ${typeLabel}
- Адрес: ${p.address || 'не указан'}
- Площадь: ${p.area ? `${p.area} м²` : 'не указана'}
- Этаж: ${p.floor || 'не указан'}`;
  } else {
    const p = values.electronics;
    const typeLabel = p.type === 'phone' ? 'Телефон' : p.type === 'laptop' ? 'Ноутбук' : p.type === 'misc' ? 'Другое' : 'не указан';
    paramsText = `
- Тип: ${typeLabel}
- Бренд: ${p.brand || 'не указан'}
- Модель: ${p.model || 'не указана'}
- Цвет: ${p.color || 'не указан'}
- Состояние: ${p.condition === 'new' ? 'Новое' : p.condition === 'used' ? 'Б/у' : 'не указано'}`;
  }

  const currentDescription = values.description?.trim();
  if (currentDescription) {
    return `Улучши существующее описание для объявления о продаже "${values.title}" (категория: ${values.category}).
Характеристики:${paramsText}
Цена: ${values.price.toLocaleString()} ₽

Текущее описание: "${currentDescription}"

Напиши улучшенную версию на русском языке, длиной 3-5 предложений. Сохрани ключевую информацию, сделай текст более привлекательным и убедительным. Не используй маркированные списки, пиши сплошным текстом.`;
  } else {
    return `Напиши привлекательное и подробное описание для объявления о продаже "${values.title}" (категория: ${values.category}).
Характеристики:${paramsText}
Цена: ${values.price.toLocaleString()} ₽

Напиши описание на русском языке, длиной 3-5 предложений. Будь информативным и убедительным. Не используй маркированные списки, пиши сплошным текстом.`;
  }
}

function generatePricePrompt(values: FormValues): string {
  let paramsText = '';

  if (values.category === 'auto') {
    const p = values.auto;
    paramsText = `
Марка: ${p.brand || 'не указана'}
Модель: ${p.model || 'не указана'}
Год выпуска: ${p.yearOfManufacture || 'не указан'}
Пробег: ${p.mileage ? `${p.mileage.toLocaleString()} км` : 'не указан'}`;
  } else if (values.category === 'real_estate') {
    const p = values.realEstate;
    paramsText = `
Тип: ${p.type === 'flat' ? 'Квартира' : p.type === 'house' ? 'Дом' : p.type === 'room' ? 'Комната' : 'не указан'}
Площадь: ${p.area ? `${p.area} м²` : 'не указана'}
Этаж: ${p.floor || 'не указан'}`;
  } else {
    const p = values.electronics;
    paramsText = `
Тип: ${p.type === 'phone' ? 'Телефон' : p.type === 'laptop' ? 'Ноутбук' : p.type === 'misc' ? 'Другое' : 'не указан'}
Бренд: ${p.brand || 'не указан'}
Модель: ${p.model || 'не указана'}
Состояние: ${p.condition === 'new' ? 'Новое' : p.condition === 'used' ? 'Б/у' : 'не указано'}`;
  }

  return `Определи рыночную цену для "${values.title}" (категория: ${values.category}).

Характеристики:
${paramsText}

Ответь в формате:
Средняя цена: [сумма] ₽ — [диапазон] ₽ — [диапазон] ₽

Пример ответа:
Средняя цена на MacBook Pro 16" M1 Pro (16/512GB):
115 000 – 135 000 ₽ — отличное состояние.
От 140 000 ₽ — идеал, малый износ АКБ.
90 000 – 110 000 ₽ — срочно или с дефектами.

Напиши ответ на русском языке.`;
}

export default function AdEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading, isError } = useGetItemQuery(id ?? '', { skip: !id });
  const [updateItem, { isLoading: saving, isError: saveError, error: saveErr }] =
    useUpdateItemMutation();

  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [isDescriptionLoading, setIsDescriptionLoading] = useState(false);
  const [priceResult, setPriceResult] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [descriptionResult, setDescriptionResult] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  const priceAbortRef = useRef<AbortController | null>(null);
  const descriptionAbortRef = useRef<AbortController | null>(null);

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
  });

  const validateForm = (values: FormValues): Record<string, string | null> => {
    const errors: Record<string, string | null> = {};

    if (!values.title.trim()) {
      errors.title = 'Укажите название';
    }

    if (values.price === undefined || values.price === null) {
      errors.price = 'Укажите цену';
    } else if (values.price <= 0) {
      errors.price = 'Цена должна быть больше 0';
    }

    if (values.category === 'auto') {
      if (!values.auto.transmission) {
        errors['auto.transmission'] = 'Выберите тип КПП';
      }
    } else if (values.category === 'real_estate') {
      if (!values.realEstate.type) {
        errors['realEstate.type'] = 'Выберите тип недвижимости';
      }
    } else if (values.category === 'electronics') {
      if (!values.electronics.type) {
        errors['electronics.type'] = 'Выберите тип устройства';
      }
    }

    return errors;
  };

  const handleGeneratePrice = async () => {
    if (priceAbortRef.current) {
      priceAbortRef.current.abort();
    }

    priceAbortRef.current = new AbortController();
    setIsPriceLoading(true);
    setPriceError(null);
    setPriceResult(null);

    try {
      const values = form.getValues();
      const prompt = generatePricePrompt(values);

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: AI_MODEL,
          prompt: prompt,
          stream: false,
        }),
        signal: priceAbortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.response || '';
      setPriceResult(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      setPriceError('Произошла ошибка при запросе к AI');
      console.error(error);
    } finally {
      setIsPriceLoading(false);
      priceAbortRef.current = null;
    }
  };

  const handleGenerateDescription = async () => {
    if (descriptionAbortRef.current) {
      descriptionAbortRef.current.abort();
    }

    descriptionAbortRef.current = new AbortController();
    setIsDescriptionLoading(true);
    setDescriptionError(null);
    setDescriptionResult(null);

    try {
      const values = form.getValues();
      const prompt = generateDescriptionPrompt(values);

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: AI_MODEL,
          prompt: prompt,
          stream: false,
        }),
        signal: descriptionAbortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.response || '';
      setDescriptionResult(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      setDescriptionError('Произошла ошибка при запросе к AI');
      console.error(error);
    } finally {
      setIsDescriptionLoading(false);
      descriptionAbortRef.current = null;
    }
  };

  const applyPrice = () => {
    if (priceResult) {
      const priceMatch = priceResult.match(/\d{2,6}[0-9\s]*[0-9]/);
      if (priceMatch) {
        const price = parseInt(priceMatch[0].replace(/\s/g, ''), 10);
        if (!isNaN(price)) {
          form.setFieldValue('price', price);
        }
      }
    }
    setPriceResult(null);
    setPriceError(null);
  };

  const applyDescription = () => {
    if (descriptionResult) {
      form.setFieldValue('description', descriptionResult);
    }
    setDescriptionResult(null);
    setDescriptionError(null);
  };

  const getDescriptionButtonText = () => {
    if (isDescriptionLoading) return 'Выполняется запрос...';
    if (descriptionResult || descriptionError) return 'Повторить запрос';
    if (form.values.description?.trim()) return 'Улучшить описание';
    return 'Придумать описание';
  };

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
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([field, error]) => {
        if (error) {
          form.setFieldError(field as any, error);
        }
      });
      return;
    }

    const body = buildPayload(values);
    updateItem({ id, body })
      .unwrap()
      .then(() => {
        clearDraftFromLocalStorage();

        notifications.show({
          title: 'Успешно!',
          message: 'Изменения сохранены',
          color: 'green',
          icon: <IconCheck size={16} />,
          autoClose: 3000,
          position: 'top-right',
        });

        navigate(`/ads/${id}`);
      })
      .catch((error) => {
        console.error(error);

        notifications.show({
          title: 'Ошибка сохранения',
          message: 'При попытке сохранить изменения произошла ошибка. Попробуйте ещё раз или зайдите позже.',
          color: 'red',
          autoClose: 5000,
          position: 'top-right',
        });
      });
  });

  const cat = form.values.category;

  return (
    <Container style={{ maxWidth: 1368 }}>
      <form onSubmit={handleSubmit} noValidate>
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
              form.clearFieldError('auto.transmission');
              form.clearFieldError('realEstate.type');
              form.clearFieldError('electronics.type');
              form.clearFieldError('title');
              form.clearFieldError('price');
              setPriceResult(null);
              setPriceError(null);
              setDescriptionResult(null);
              setDescriptionError(null);
            }}
            style={{ width: 456 }}
          />

          <TextInput
            label="Название"
            required
            {...form.getInputProps('title')}
            style={{ width: 456 }}
            error={form.errors.title}
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

<Box style={{ position: 'relative', width: 456 }}>
            <NumberInput
              label="Цена, ₽"
              required
              min={0}
              {...form.getInputProps('price')}
              error={form.errors.price}
              style={{ width: '100%' }}
            />

            <Box
              style={{
                position: 'absolute',
                left: '100%',
                top: 25,
                marginLeft: 20,
              }}
            >
              <Popover
                opened={!!priceResult || !!priceError}
                onClose={() => {
                  setPriceResult(null);
                  setPriceError(null);
                }}
                width={400}
                position="top-start"
                offset={{ mainAxis: 10, crossAxis: 0 }}
                withArrow
              >
                <Popover.Target>
                  <Button
                    variant="light"
                    leftSection={isPriceLoading ? <Loader size={16} /> : <IconBulb size={16} />}
                    onClick={handleGeneratePrice}
                    disabled={isPriceLoading}
                    style={{ backgroundColor: '#F9F1E6', color: '#FFA940' }}
                  >
                    {isPriceLoading ? 'Выполняется запрос...' : (priceResult || priceError ? 'Повторить запрос' : 'Узнать рыночную цену')}
                  </Button>
                </Popover.Target>
                <Popover.Dropdown>
                  {priceResult && (
                    <Stack>
                      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                        {priceResult}
                      </Text>
                      <Divider />
                      <Group justify="flex-start">
                        <Button size="xs" onClick={applyPrice}>
                          Применить
                        </Button>
                        <Button size="xs" variant="default" onClick={() => setPriceResult(null)}>
                          Закрыть
                        </Button>
                      </Group>
                    </Stack>
                  )}
                  {priceError && (
                    <Stack>
                      <Group gap="xs">
                        <IconAlertCircle size={18} color="orange" />
                        <Text size="sm" c="orange" fw={500}>
                          {priceError}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        Попробуйте повторить запрос или закройте уведомление.
                      </Text>
                      <Divider />
                      <Group justify="flex-end">
                        <Button size="xs" variant="default" onClick={() => setPriceError(null)}>
                          Закрыть
                        </Button>
                        <Button size="xs" onClick={handleGeneratePrice}>
                          Повторить
                        </Button>
                      </Group>
                    </Stack>
                  )}
                </Popover.Dropdown>
              </Popover>
            </Box>
          </Box>

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
                label="Тип КПП"
                required
                clearable
                data={[
                  { value: 'automatic', label: 'Автомат' },
                  { value: 'manual', label: 'Механика' },
                ]}
                value={form.values.auto.transmission || null}
                onChange={(val) => form.setFieldValue('auto.transmission', val as 'automatic' | 'manual' | undefined)}
                error={form.errors['auto.transmission']}
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
            </Stack>
          )}

          {cat === 'real_estate' && (
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
                value={form.values.realEstate.type || null}
                onChange={(val) => form.setFieldValue('realEstate.type', val as 'flat' | 'house' | 'room' | undefined)}
                error={form.errors['realEstate.type']}
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
            </Stack>
          )}

          {cat === 'electronics' && (
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
                value={form.values.electronics.type || null}
                onChange={(val) => form.setFieldValue('electronics.type', val as 'phone' | 'laptop' | 'misc' | undefined)}
                error={form.errors['electronics.type']}
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
            </Stack>
          )}

          <Textarea
            label="Описание"
            minRows={4}
            maxRows={10}
            autosize
            resize="vertical"
            {...form.getInputProps('description')}
            w="100%"
          />

<Box style={{ position: 'relative' }}>
            <Popover
              opened={!!descriptionResult || !!descriptionError}
              onClose={() => {
                setDescriptionResult(null);
                setDescriptionError(null);
              }}
              width={450}
              position="right-start"
              offset={{ mainAxis: 10, crossAxis: 0 }}
              withArrow
              zIndex={1000}
            >
              <Popover.Target>
                <Button
                  variant="light"
                  leftSection={isDescriptionLoading ? <Loader size={16} /> : <IconBulb size={16} />}
                  onClick={handleGenerateDescription}
                  disabled={isDescriptionLoading}
                  style={{ backgroundColor: '#F9F1E6', color: '#FFA940' }}
                >
                  {getDescriptionButtonText()}
                </Button>
              </Popover.Target>
              <Popover.Dropdown ml={50}>
                {descriptionResult && (
                  <Stack>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {descriptionResult}
                    </Text>
                    <Divider />
                    <Group justify="flex-end">
                    <Button size="xs" onClick={applyDescription}>
                        Применить
                      </Button>
                      <Button size="xs" variant="default" onClick={() => setDescriptionResult(null)}>
                        Закрыть
                      </Button>
                    </Group>
                  </Stack>
                )}
                {descriptionError && (
                  <Stack>
                    <Group gap="xs">
                      <IconAlertCircle size={18} color="orange" />
                      <Text size="sm" c="orange" fw={500}>
                        {descriptionError}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      Попробуйте повторить запрос или закройте уведомление.
                    </Text>
                    <Divider />
                    <Group justify="flex-end">
                      <Button size="xs" variant="default" onClick={() => setDescriptionError(null)}>
                        Закрыть
                      </Button>
                      <Button size="xs" onClick={handleGenerateDescription}>
                        Повторить
                      </Button>
                    </Group>
                  </Stack>
                )}
              </Popover.Dropdown>
            </Popover>
          </Box>

          <Group justify="flex-start" mb={20}>
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
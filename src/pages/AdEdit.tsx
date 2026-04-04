import { Container, Stack, Title, Select, TextInput, Button, Alert, ActionIcon, Group, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import { useGetItemQuery } from '../api/itemsApi';
import { useEditForm } from '../hooks/useEditForm';
import { useDraft } from '../hooks/useDraft';
import { useAI } from '../hooks/useAI';
import { PriceField } from '../components/adEdit/PriceField';
import { DescriptionField } from '../components/adEdit/DescriptionField';
import { CharacteristicsFields } from '../components/adEdit/CharacteristicsFields';

export default function AdEdit() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading, isError } = useGetItemQuery(id ?? '', { skip: !id });
  const { form, saving, saveError, saveErr, handleSubmit, handleCancel } = useEditForm({ id, item });
  const ai = useAI();
  useDraft(id, form, item);

  if (!id) return <Container><Title order={4}>Некорректный идентификатор</Title></Container>;
  if (isLoading || !item) return <Container><Title order={4}>Загрузка…</Title></Container>;
  if (isError) return <Container><Alert color="red">Не удалось загрузить объявление</Alert><Button component={Link} to="/ads">К списку</Button></Container>;

  const cat = form.values.category;

  return (
    <Container style={{ maxWidth: 1368 }}>
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="lg">
          <Title order={2}>Редактирование</Title>
          {saveError && (
            <Alert color="red" title="Ошибка сохранения">
              {saveErr && 'status' in saveErr ? `Код ${saveErr.status}` : 'Проверьте данные и API.'}
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
              const next = (v as 'auto' | 'electronics' | 'real_estate') || 'auto';
              form.setFieldValue('category', next);
              form.setFieldValue('auto', {
                brand: '',
                model: '',
                yearOfManufacture: null,
                transmission: null,
                mileage: null,
                enginePower: null,
              });
              form.setFieldValue('realEstate', {
                type: null,
                address: '',
                area: null,
                floor: null,
              });
              form.setFieldValue('electronics', {
                type: null,
                brand: '',
                model: '',
                color: '',
                condition: null,
              });
              form.clearFieldError('auto.transmission');
              form.clearFieldError('realEstate.type');
              form.clearFieldError('electronics.type');
              form.clearFieldError('title');
              form.clearFieldError('price');
              ai.resetPrice();
              ai.resetDescription();
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
                <ActionIcon onClick={() => form.setFieldValue('title', '')} variant="subtle" size="sm" color="gray">
                  <IconX size={14} />
                </ActionIcon>
              )
            }
          />

          <PriceField form={form} ai={ai} />

          <Text fw={700}>Характеристики</Text>
          <CharacteristicsFields category={cat} form={form} />

          <DescriptionField form={form} ai={ai} />

          <Group justify="flex-start" mb={20}>
            <Button type="submit" loading={saving}>Сохранить</Button>
            <Button variant="default" onClick={handleCancel}>Отменить</Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
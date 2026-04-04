import { Container, Stack, Flex, Box, Button, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import { useGetItemQuery } from '../api/itemsApi';
import { AdHeader } from '../components/adDetails/AdHeader';
import { AdPicture } from '../components/adDetails/AdPicture';
import { AdDescription } from '../components/adDetails/AdDescription';
import { ParamsTable } from '../components/adDetails/ParamsTable';
import { MissingFieldsAlert } from '../components/adDetails/MissingFieldsAlert';
import { getMissingFields } from '../utils/missingFields';

export default function AdDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading, isError, error } = useGetItemQuery(id ?? '', { skip: !id });

  if (!id) {
    return (
      <Container style={{ maxWidth: 1368 }}>
        <Text>Некорректный идентификатор</Text>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container style={{ maxWidth: 1368 }}>
        <Text>Загрузка…</Text>
      </Container>
    );
  }

  if (isError || !item) {
    return (
      <Container style={{ maxWidth: 1368 }}>
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
    <Container style={{ maxWidth: 1368 }}>
      <Stack gap="xl">
        <AdHeader item={item} />

        <Flex gap={32}>
          <AdPicture title={item.title} />
          <Flex gap={36} direction="column" style={{ width: '527px' }}>
            <MissingFieldsAlert missingFields={missingFields} />
            <Box>
              <Title order={4} mb="sm">
                Характеристики
              </Title>
              <ParamsTable item={item} />
            </Box>
          </Flex>
        </Flex>

        {item.description && <AdDescription description={item.description} />}
      </Stack>
    </Container>
  );
}
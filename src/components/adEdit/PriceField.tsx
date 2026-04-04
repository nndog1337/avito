import { Box, NumberInput, Popover, Button, Group, Stack, Text, Divider, Loader } from '@mantine/core';
import { IconBulb, IconAlertCircle } from '@tabler/icons-react';

interface PriceFieldProps {
  form: any;
  ai: {
    isPriceLoading: boolean;
    priceResult: string | null;
    priceError: string | null;
    generatePrice: (values: any) => void;
    resetPrice: () => void;
    extractPriceFromResult: (result: string) => number | null;
  };
}

export function PriceField({ form, ai }: PriceFieldProps) {
  const handleApplyPrice = () => {
    if (ai.priceResult) {
      const price = ai.extractPriceFromResult(ai.priceResult);
      if (price !== null) {
        form.setFieldValue('price', price);
      }
    }
    ai.resetPrice();
  };

  return (
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
          opened={!!ai.priceResult || !!ai.priceError}
          onClose={ai.resetPrice}
          width={400}
          position="top-start"
          offset={{ mainAxis: 10, crossAxis: 0 }}
          withArrow
        >
          <Popover.Target>
            <Button
              variant="light"
              leftSection={ai.isPriceLoading ? <Loader size={16} /> : <IconBulb size={16} />}
              onClick={() => ai.generatePrice(form.getValues())}
              disabled={ai.isPriceLoading}
              style={{ backgroundColor: '#F9F1E6', color: '#FFA940' }}
            >
              {ai.isPriceLoading
                ? 'Выполняется запрос...'
                : ai.priceResult || ai.priceError
                ? 'Повторить запрос'
                : 'Узнать рыночную цену'}
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            {ai.priceResult && (
              <Stack>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {ai.priceResult}
                </Text>
                <Divider />
                <Group justify="flex-start">
                  <Button size="xs" onClick={handleApplyPrice}>
                    Применить
                  </Button>
                  <Button size="xs" variant="default" onClick={ai.resetPrice}>
                    Закрыть
                  </Button>
                </Group>
              </Stack>
            )}
            {ai.priceError && (
              <Stack>
                <Group gap="xs">
                  <IconAlertCircle size={18} color="orange" />
                  <Text size="sm" c="orange" fw={500}>
                    {ai.priceError}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  Попробуйте повторить запрос или закройте уведомление.
                </Text>
                <Divider />
                <Group justify="flex-end">
                  <Button size="xs" variant="default" onClick={ai.resetPrice}>
                    Закрыть
                  </Button>
                  <Button size="xs" onClick={() => ai.generatePrice(form.getValues())}>
                    Повторить
                  </Button>
                </Group>
              </Stack>
            )}
          </Popover.Dropdown>
        </Popover>
      </Box>
    </Box>
  );
}
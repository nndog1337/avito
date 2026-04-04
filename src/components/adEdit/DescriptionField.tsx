import { Box, Textarea, Popover, Button, Group, Stack, Text, Divider, Loader } from '@mantine/core';
import { IconBulb, IconAlertCircle } from '@tabler/icons-react';

interface DescriptionFieldProps {
  form: any;
  ai: {
    isDescriptionLoading: boolean;
    descriptionResult: string | null;
    descriptionError: string | null;
    generateDescription: (values: any) => void;
    resetDescription: () => void;
  };
}

export function DescriptionField({ form, ai }: DescriptionFieldProps) {
  const getButtonText = () => {
    if (ai.isDescriptionLoading) return 'Выполняется запрос...';
    if (ai.descriptionResult || ai.descriptionError) return 'Повторить запрос';
    if (form.values.description?.trim()) return 'Улучшить описание';
    return 'Придумать описание';
  };

  const handleApplyDescription = () => {
    if (ai.descriptionResult) {
      form.setFieldValue('description', ai.descriptionResult);
    }
    ai.resetDescription();
  };

  return (
    <Box style={{ position: 'relative' }}>
      <Textarea
        label="Описание"
        minRows={4}
        maxRows={10}
        autosize
        resize="vertical"
        {...form.getInputProps('description')}
        w="100%"
      />

      <Box style={{ position: 'relative', marginTop: 8 }}>
        <Popover
          opened={!!ai.descriptionResult || !!ai.descriptionError}
          onClose={ai.resetDescription}
          width={450}
          position="right-start"
          offset={{ mainAxis: 10, crossAxis: 0 }}
          withArrow
          zIndex={1000}
        >
          <Popover.Target>
            <Button
              variant="light"
              leftSection={ai.isDescriptionLoading ? <Loader size={16} /> : <IconBulb size={16} />}
              onClick={() => ai.generateDescription(form.getValues())}
              disabled={ai.isDescriptionLoading}
              style={{ backgroundColor: '#F9F1E6', color: '#FFA940' }}
            >
              {getButtonText()}
            </Button>
          </Popover.Target>
          <Popover.Dropdown ml={50}>
            {ai.descriptionResult && (
              <Stack>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {ai.descriptionResult}
                </Text>
                <Divider />
                <Group justify="flex-end">
                  <Button size="xs" onClick={handleApplyDescription}>
                    Применить
                  </Button>
                  <Button size="xs" variant="default" onClick={ai.resetDescription}>
                    Закрыть
                  </Button>
                </Group>
              </Stack>
            )}
            {ai.descriptionError && (
              <Stack>
                <Group gap="xs">
                  <IconAlertCircle size={18} color="orange" />
                  <Text size="sm" c="orange" fw={500}>
                    {ai.descriptionError}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  Попробуйте повторить запрос или закройте уведомление.
                </Text>
                <Divider />
                <Group justify="flex-end">
                  <Button size="xs" variant="default" onClick={ai.resetDescription}>
                    Закрыть
                  </Button>
                  <Button size="xs" onClick={() => ai.generateDescription(form.getValues())}>
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
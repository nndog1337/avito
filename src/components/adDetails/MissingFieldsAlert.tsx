import { Alert, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface MissingFieldsAlertProps {
  missingFields: string[];
}

export function MissingFieldsAlert({ missingFields }: MissingFieldsAlertProps) {
  if (missingFields.length === 0) return null;

  return (
    <Alert
      color="yellow"
      icon={<IconAlertCircle size={18} />}
      title="Требуются доработки"
      variant="light"
      style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
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
  );
}
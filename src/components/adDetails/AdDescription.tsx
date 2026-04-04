import { Box, Title, Paper, Text } from '@mantine/core';

interface AdDescriptionProps {
  description: string;
}

export function AdDescription({ description }: AdDescriptionProps) {
  return (
    <Box>
      <Title order={4} mb="sm">
        Описание
      </Title>
      <Paper style={{ width: '480px' }}>
        <Text
          size="sm"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {description}
        </Text>
      </Paper>
    </Box>
  );
}
import { Flex, Box } from '@mantine/core';
import { ListItem } from '../../types/api';
import { AdCard } from '../common/AdCard';

interface AdsGridProps {
  items: ListItem[];
}

export function AdsGrid({ items }: AdsGridProps) {
  return (
    <Flex gap={15} wrap="wrap" align="stretch">
      {items.map((item, index) => (
        <Box key={`${item.category}-${item.title}-${index}`} style={{ flex: '0 0 auto', minWidth: 200 }}>
          <AdCard item={item} />
        </Box>
      ))}
    </Flex>
  );
}
import { Switch, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme();

  return (
    <Switch
      checked={computedColorScheme === 'dark'}
      onChange={(event) => setColorScheme(event.currentTarget.checked ? 'dark' : 'light')}
      size="lg"
      onLabel={<IconSun size={14} />}
      offLabel={<IconMoon size={14} />}
    />
  );
}
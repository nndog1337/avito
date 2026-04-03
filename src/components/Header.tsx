import { AppShell, Container, Flex, Anchor } from '@mantine/core';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../theme/ThemeToggle ';

export function Header() {
  const location = useLocation();
  const isAdsPage = location.pathname === '/ads';

  return (
    <AppShell.Header style={{ position: 'static'}}>
    <Container style={{ maxWidth: 1368 }} h="100%">
      <Flex justify={isAdsPage ? "flex-end" : "space-between"} align="center" h="100%">
        {!isAdsPage && (
          <Anchor component={Link} to="/ads" underline="never" size="xl">
            Мои объявления
          </Anchor>
        )}
        <ThemeToggle />
      </Flex>
    </Container>
  </AppShell.Header>
  );
}
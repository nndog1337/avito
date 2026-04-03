import { AppShell} from '@mantine/core';
import { Navigate, Route, Routes,} from 'react-router-dom';
import AdDetails from './pages/AdDetails';
import AdEdit from './pages/AdEdit';
import AdsList from './pages/AdsList';
import { Header } from './components/Header';

export default function App() {
  return (
    <AppShell
      header={{ height: 60 }}
    >
      <Header/>

      <AppShell.Main style={{paddingTop: '10px'}}>
        <Routes>
          <Route path="/" element={<Navigate to="/ads" replace />} />
          <Route path="/ads" element={<AdsList />} />
          <Route path="/ads/:id/edit" element={<AdEdit />} />
          <Route path="/ads/:id" element={<AdDetails />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

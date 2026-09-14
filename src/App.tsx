import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Nav } from '@/lib/ui/Nav';
import { Container } from '@/lib/ui/Container';
import { Button } from '@/lib/ui/Button';
import { EmptyState } from '@/lib/ui/EmptyState';
import { Compass, Trophy } from 'lucide-react';
import { Home } from '@/pages/Home';
import { LeaguePage } from '@/pages/LeaguePage';
import { RosterPage } from '@/pages/RosterPage';

function Brand() {
  const navigate = useNavigate();
  return (
    <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2 px-0 text-h3 font-semibold hover:bg-transparent">
      <Trophy size={20} />
      RosterWatch
    </Button>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Nav brand={<Brand />} />
      <main className="py-8">
        <Container>{children}</Container>
      </main>
    </div>
  );
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon={<Compass size={40} />}
      title="Page not found"
      description="That route doesn't exist. Head back home and search for a Sleeper username."
      action={<Button onClick={() => navigate('/')}>Go home</Button>}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/league/:leagueId" element={<Layout><LeaguePage /></Layout>} />
        <Route path="/league/:leagueId/roster/:rosterId" element={<Layout><RosterPage /></Layout>} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

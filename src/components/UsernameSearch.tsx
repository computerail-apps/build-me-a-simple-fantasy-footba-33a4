import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/lib/ui/Card';
import { Input } from '@/lib/ui/Input';
import { Button } from '@/lib/ui/Button';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { EmptyState } from '@/lib/ui/EmptyState';
import { Search, ShieldQuestion, ChevronRight } from 'lucide-react';
import { getUser, getUserLeagues, getNflState, type SleeperLeague } from '@/lib/sleeper';
import { setLastUser } from '@/lib/lastUser';

export function UsernameSearch() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const search = useMutation({
    mutationFn: async (name: string) => {
      const user = await getUser(name);
      if (!user) throw new Error(`No Sleeper user found for "${name}".`);
      const state = await getNflState();
      const leagues = await getUserLeagues(user.user_id, state.season);
      setLastUser({ username: user.username, user_id: user.user_id });
      return { user, leagues };
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find your leagues</CardTitle>
        <CardDescription>Enter your Sleeper username to pull your live NFL leagues.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (username.trim()) search.mutate(username.trim());
          }}
        >
          <Input
            placeholder="Sleeper username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={search.isPending}
            className="flex-1"
          />
          <Button type="submit" disabled={search.isPending || !username.trim()}>
            <Search size={16} />
            {search.isPending ? 'Searching…' : 'Search'}
          </Button>
        </form>

        {search.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn't find that user</AlertTitle>
            <AlertDescription>{(search.error as Error).message}</AlertDescription>
          </Alert>
        ) : null}

        {search.isSuccess ? (
          <LeagueResults leagues={search.data.leagues} username={search.data.user.username} />
        ) : null}
      </CardContent>
    </Card>
  );
}

function LeagueResults({ leagues, username }: { leagues: SleeperLeague[]; username: string }) {
  const navigate = useNavigate();

  if (leagues.length === 0) {
    return (
      <EmptyState
        icon={<ShieldQuestion size={40} />}
        title="No leagues found"
        description={`${username} doesn't have any NFL leagues for the current season.`}
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-small text-muted-foreground">{leagues.length} league{leagues.length === 1 ? '' : 's'} for {username}</div>
      <div className="divide-y divide-border rounded-lg border border-border">
        {leagues.map((l) => (
          <div key={l.league_id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <div className="text-body font-medium text-foreground">{l.name}</div>
              <div className="text-small text-muted-foreground">{l.season} · {l.total_rosters} teams</div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigate(`/league/${l.league_id}`)}>
              View
              <ChevronRight size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

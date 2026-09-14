import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/lib/ui/Button';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { ArrowLeft } from 'lucide-react';
import { getLeague, getLeagueRosters, getLeagueUsers } from '@/lib/sleeper';
import { StandingsTable } from '@/components/StandingsTable';
import { SaveLeagueButton } from '@/components/SaveLeagueButton';

export function LeaguePage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['league', leagueId],
    enabled: !!leagueId,
    queryFn: async () => {
      const [league, rosters, users] = await Promise.all([
        getLeague(leagueId as string),
        getLeagueRosters(leagueId as string),
        getLeagueUsers(leagueId as string),
      ]);
      return { league, rosters, users };
    },
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
        <ArrowLeft size={16} />
        Back to search
      </Button>

      {isLoading ? (
        <CenteredSpinner label="Loading league" />
      ) : error ? (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertTitle>Couldn't load this league</AlertTitle>
            <AlertDescription>{(error as Error).message}</AlertDescription>
          </Alert>
          <Button size="sm" variant="secondary" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-h1 text-foreground">{data.league.name}</h1>
              <p className="text-small text-muted-foreground">{data.league.season} season · {data.league.total_rosters} teams</p>
            </div>
            <SaveLeagueButton leagueId={data.league.league_id} leagueName={data.league.name} season={data.league.season} />
          </div>
          <StandingsTable leagueId={data.league.league_id} rosters={data.rosters} users={data.users} />
        </div>
      ) : null}
    </div>
  );
}

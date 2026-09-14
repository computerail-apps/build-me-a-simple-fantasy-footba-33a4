import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/lib/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/lib/ui/Card';
import { Badge } from '@/lib/ui/Badge';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { ArrowLeft } from 'lucide-react';
import {
  getLeagueRosters,
  getLeagueUsers,
  getMatchups,
  getNflState,
  getPlayers,
  fptsTotal,
  type SleeperRoster,
  type SleeperMatchup,
  type SleeperPlayer,
} from '@/lib/sleeper';
import { RosterSection } from '@/components/RosterSection';

export function RosterPage() {
  const { leagueId, rosterId } = useParams<{ leagueId: string; rosterId: string }>();
  const navigate = useNavigate();
  const rosterIdNum = Number(rosterId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['roster', leagueId, rosterId],
    enabled: !!leagueId && !!rosterId,
    queryFn: async () => {
      const state = await getNflState();
      const week = state.display_week || state.week || 1;
      const [rosters, users, matchups, players] = await Promise.all([
        getLeagueRosters(leagueId as string),
        getLeagueUsers(leagueId as string),
        getMatchups(leagueId as string, week),
        getPlayers(),
      ]);
      const roster = rosters.find((r) => r.roster_id === rosterIdNum);
      const matchup = matchups.find((m) => m.roster_id === rosterIdNum);
      const owner = users.find((u) => u.user_id === roster?.owner_id);
      return { week, roster, matchup, owner, players };
    },
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/league/${leagueId}`)} className="gap-2">
        <ArrowLeft size={16} />
        Back to standings
      </Button>

      {isLoading ? (
        <CenteredSpinner label="Loading roster" />
      ) : error ? (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertTitle>Couldn't load this roster</AlertTitle>
            <AlertDescription>{(error as Error).message}</AlertDescription>
          </Alert>
          <Button size="sm" variant="secondary" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : !data || !data.roster ? (
        <Alert variant="destructive">
          <AlertTitle>Roster not found</AlertTitle>
          <AlertDescription>This roster ID doesn't exist in this league.</AlertDescription>
        </Alert>
      ) : (
        <RosterDetail
          week={data.week}
          teamName={data.owner?.metadata?.team_name || data.owner?.display_name || `Roster ${data.roster.roster_id}`}
          roster={data.roster}
          matchup={data.matchup}
          players={data.players}
        />
      )}
    </div>
  );
}

function RosterDetail({
  week,
  teamName,
  roster,
  matchup,
  players,
}: {
  week: number;
  teamName: string;
  roster: SleeperRoster;
  matchup: SleeperMatchup | undefined;
  players: Record<string, SleeperPlayer>;
}) {
  const record = `${roster.settings.wins ?? 0}-${roster.settings.losses ?? 0}${roster.settings.ties ? `-${roster.settings.ties}` : ''}`;
  const pf = fptsTotal(roster.settings.fpts, roster.settings.fpts_decimal).toFixed(2);
  const pa = fptsTotal(roster.settings.fpts_against, roster.settings.fpts_against_decimal).toFixed(2);

  const starters: string[] = matchup?.starters ?? roster.starters ?? [];
  const allPlayers: string[] = matchup?.players ?? roster.players ?? [];
  const bench = allPlayers.filter((id) => !starters.includes(id));

  function pointsFor(id: string): number | null {
    if (!matchup?.players_points) return null;
    const p = matchup.players_points[id];
    return typeof p === 'number' ? p : null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{teamName}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">Record {record}</Badge>
          <Badge variant="outline">PF {pf}</Badge>
          <Badge variant="outline">PA {pa}</Badge>
          <Badge variant="default">Week {week}</Badge>
          {matchup ? <Badge variant="success">This week: {matchup.points.toFixed(2)} pts</Badge> : null}
        </CardContent>
      </Card>

      <RosterSection title="Starters" playerIds={starters} players={players} pointsFor={pointsFor} badgeVariant="success" />
      <RosterSection title="Bench" playerIds={bench} players={players} pointsFor={pointsFor} badgeVariant="default" />
    </div>
  );
}

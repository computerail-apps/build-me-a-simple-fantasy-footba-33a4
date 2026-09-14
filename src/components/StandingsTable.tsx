import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/lib/ui/Card';
import { Button } from '@/lib/ui/Button';
import { Badge } from '@/lib/ui/Badge';
import { EmptyState } from '@/lib/ui/EmptyState';
import { Users, ChevronRight } from 'lucide-react';
import { fptsTotal, type SleeperRoster, type SleeperLeagueUser } from '@/lib/sleeper';

interface Props {
  leagueId: string;
  rosters: SleeperRoster[];
  users: SleeperLeagueUser[];
}

function teamName(roster: SleeperRoster, users: SleeperLeagueUser[]): string {
  const owner = users.find((u) => u.user_id === roster.owner_id);
  return owner?.metadata?.team_name || owner?.display_name || `Roster ${roster.roster_id}`;
}

export function StandingsTable({ leagueId, rosters, users }: Props) {
  const navigate = useNavigate();

  if (rosters.length === 0) {
    return <EmptyState icon={<Users size={40} />} title="No rosters found" description="This league has no rosters yet." />;
  }

  const ranked = [...rosters].sort((a, b) => {
    const aw = a.settings.wins ?? 0;
    const bw = b.settings.wins ?? 0;
    if (bw !== aw) return bw - aw;
    const af = fptsTotal(a.settings.fpts, a.settings.fpts_decimal);
    const bf = fptsTotal(b.settings.fpts, b.settings.fpts_decimal);
    return bf - af;
  });

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {ranked.map((roster, idx) => {
            const pf = fptsTotal(roster.settings.fpts, roster.settings.fpts_decimal).toFixed(2);
            const pa = fptsTotal(roster.settings.fpts_against, roster.settings.fpts_against_decimal).toFixed(2);
            const record = `${roster.settings.wins ?? 0}-${roster.settings.losses ?? 0}${roster.settings.ties ? `-${roster.settings.ties}` : ''}`;
            return (
              <li key={roster.roster_id} className="flex items-center gap-4 px-6 py-3">
                <span className="w-6 text-small tabular-nums text-muted-foreground">{idx + 1}</span>
                <div className="flex-1">
                  <div className="text-body font-medium text-foreground">{teamName(roster, users)}</div>
                  <div className="text-small text-muted-foreground">PF {pf} · PA {pa}</div>
                </div>
                <Badge variant="outline">{record}</Badge>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/league/${leagueId}/roster/${roster.roster_id}`)}>
                  View
                  <ChevronRight size={16} />
                </Button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

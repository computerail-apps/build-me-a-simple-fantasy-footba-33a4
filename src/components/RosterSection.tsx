import { Card, CardHeader, CardTitle, CardContent } from '@/lib/ui/Card';
import { Badge } from '@/lib/ui/Badge';
import { EmptyState } from '@/lib/ui/EmptyState';
import { Users } from 'lucide-react';
import { playerDisplayName, playerMeta, type SleeperPlayer } from '@/lib/sleeper';

interface Props {
  title: string;
  playerIds: string[];
  players: Record<string, SleeperPlayer> | undefined;
  pointsFor: (id: string) => number | null;
  badgeVariant: 'success' | 'default';
}

export function RosterSection({ title, playerIds, players, pointsFor, badgeVariant }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {playerIds.length === 0 ? (
          <div className="px-6 pb-6">
            <EmptyState icon={<Users size={40} />} title="No players" description="Nothing to show here for this week." />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {playerIds.map((id) => {
              const meta = playerMeta(id, players);
              const pts = pointsFor(id);
              return (
                <li key={id} className="flex items-center gap-3 px-6 py-3">
                  <Badge variant={badgeVariant}>{meta.position}</Badge>
                  <div className="flex-1">
                    <div className="text-body font-medium text-foreground">{playerDisplayName(id, players)}</div>
                    <div className="text-small text-muted-foreground">{meta.team}</div>
                  </div>
                  <span className="text-body tabular-nums text-foreground">{pts === null ? '—' : pts.toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

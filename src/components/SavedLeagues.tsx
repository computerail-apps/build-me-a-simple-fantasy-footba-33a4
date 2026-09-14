import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/lib/ui/Card';
import { Button } from '@/lib/ui/Button';
import { Badge } from '@/lib/ui/Badge';
import { EmptyState } from '@/lib/ui/EmptyState';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { Bookmark, ChevronRight, Trash2 } from 'lucide-react';
import { supabase, type SavedLeagueRow } from '@/lib/supabase';

export function SavedLeagues() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['saved_leagues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_leagues')
        .select('id,sleeper_username,sleeper_user_id,league_id,league_name,season,created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as SavedLeagueRow[];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('saved_leagues').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved_leagues'] }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved leagues</CardTitle>
        <CardDescription>Quick access to leagues you've saved on this device.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-10"><CenteredSpinner label="Loading saved leagues" /></div>
        ) : error ? (
          <div className="px-6 pb-6 space-y-3">
            <Alert variant="destructive">
              <AlertTitle>Couldn't load saved leagues</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
            <Button size="sm" variant="secondary" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="px-6 pb-6">
            <EmptyState
              icon={<Bookmark size={40} />}
              title="No saved leagues yet"
              description="Search a username above, open a league, and hit Save league to pin it here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((row) => (
              <li key={row.id} className="flex items-center gap-3 px-6 py-3">
                <div className="flex-1">
                  <div className="text-body font-medium text-foreground">{row.league_name}</div>
                  <div className="flex items-center gap-2 text-small text-muted-foreground">
                    <Badge variant="outline">{row.season}</Badge>
                    <span>{row.sleeper_username}</span>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/league/${row.league_id}`)}>
                  Open
                  <ChevronRight size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Remove saved league"
                  onClick={() => remove.mutate(row.id)}
                  disabled={remove.isPending}
                >
                  <Trash2 size={16} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

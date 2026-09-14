import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/lib/ui/Button';
import { Input } from '@/lib/ui/Input';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { BookmarkCheck, Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/sleeper';
import { getLastUser, setLastUser } from '@/lib/lastUser';

interface Props {
  leagueId: string;
  leagueName: string;
  season: string;
}

export function SaveLeagueButton({ leagueId, leagueName, season }: Props) {
  const qc = useQueryClient();
  const [promptUsername, setPromptUsername] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const { data: existing } = useQuery({
    queryKey: ['saved_leagues', 'check', leagueId],
    queryFn: async () => {
      const { data, error } = await supabase.from('saved_leagues').select('id').eq('league_id', leagueId).limit(1);
      if (error) throw error;
      return data && data.length > 0;
    },
  });

  const save = useMutation({
    mutationFn: async (identity: { username: string; user_id: string }) => {
      const { error } = await supabase.from('saved_leagues').upsert(
        {
          sleeper_username: identity.username,
          sleeper_user_id: identity.user_id,
          league_id: leagueId,
          league_name: leagueName,
          season,
        },
        { onConflict: 'sleeper_user_id,league_id' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved_leagues'] });
      qc.invalidateQueries({ queryKey: ['saved_leagues', 'check', leagueId] });
      setShowPrompt(false);
    },
  });

  async function handleClick() {
    const last = getLastUser();
    if (last) {
      save.mutate(last);
      return;
    }
    setShowPrompt(true);
  }

  async function handlePromptSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLookupError(null);
    try {
      const user = await getUser(promptUsername.trim());
      if (!user) {
        setLookupError(`No Sleeper user found for "${promptUsername}".`);
        return;
      }
      setLastUser({ username: user.username, user_id: user.user_id });
      save.mutate({ username: user.username, user_id: user.user_id });
    } catch (err) {
      setLookupError((err as Error).message);
    }
  }

  if (existing) {
    return (
      <Button size="sm" variant="secondary" disabled>
        <BookmarkCheck size={16} />
        Saved
      </Button>
    );
  }

  if (showPrompt) {
    return (
      <form onSubmit={handlePromptSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Your Sleeper username"
          value={promptUsername}
          onChange={(e) => setPromptUsername(e.target.value)}
          className="w-48"
        />
        <Button type="submit" size="sm" disabled={save.isPending || !promptUsername.trim()}>
          {save.isPending ? 'Saving…' : 'Confirm'}
        </Button>
        {lookupError ? (
          <Alert variant="destructive" className="sm:ml-2">
            <AlertTitle>Lookup failed</AlertTitle>
            <AlertDescription>{lookupError}</AlertDescription>
          </Alert>
        ) : null}
      </form>
    );
  }

  return (
    <Button size="sm" onClick={handleClick} disabled={save.isPending}>
      <Bookmark size={16} />
      {save.isPending ? 'Saving…' : 'Save league'}
    </Button>
  );
}

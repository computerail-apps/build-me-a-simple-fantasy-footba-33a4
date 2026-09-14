import { Trophy } from 'lucide-react';
import { UsernameSearch } from '@/components/UsernameSearch';
import { SavedLeagues } from '@/components/SavedLeagues';

export function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-3 py-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-micro text-muted-foreground">
          <Trophy size={14} />
          Live from Sleeper
        </div>
        <h1 className="text-display text-foreground">Track your fantasy squads, live.</h1>
        <p className="max-w-2xl text-body text-muted-foreground">
          RosterWatch pulls your real leagues, rosters, and weekly matchups straight from Sleeper's public
          API — no signup, no paid keys. Enter your username to jump into your leagues, and save the ones
          you check most for instant access next time.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <UsernameSearch />
        <SavedLeagues />
      </div>
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anon);

export interface SavedLeagueRow {
  id: string;
  sleeper_username: string;
  sleeper_user_id: string;
  league_id: string;
  league_name: string;
  season: string;
  created_at: string;
}

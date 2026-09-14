const BASE = 'https://api.sleeper.app/v1';

export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  total_rosters: number;
  status: string;
}

export interface SleeperRosterSettings {
  wins?: number;
  losses?: number;
  ties?: number;
  fpts?: number;
  fpts_decimal?: number;
  fpts_against?: number;
  fpts_against_decimal?: number;
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string | null;
  league_id: string;
  players: string[] | null;
  starters: string[] | null;
  settings: SleeperRosterSettings;
}

export interface SleeperLeagueUser {
  user_id: string;
  display_name: string;
  avatar: string | null;
  metadata?: { team_name?: string } | null;
}

export interface SleeperNflState {
  season: string;
  week: number;
  season_type: string;
  display_week: number;
}

export interface SleeperMatchup {
  roster_id: number;
  matchup_id: number | null;
  points: number;
  players: string[];
  starters: string[];
  starters_points?: number[];
  players_points?: Record<string, number>;
}

export interface SleeperPlayer {
  player_id?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  team?: string | null;
}

async function req<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Sleeper API returned ${res.status} for ${path}`);
  }
  return (await res.json()) as T;
}

export function getUser(username: string): Promise<SleeperUser | null> {
  return req<SleeperUser | null>(`/user/${encodeURIComponent(username.trim())}`);
}

export function getUserLeagues(userId: string, season: string): Promise<SleeperLeague[]> {
  return req<SleeperLeague[]>(`/user/${userId}/leagues/nfl/${season}`);
}

export function getLeague(leagueId: string): Promise<SleeperLeague> {
  return req<SleeperLeague>(`/league/${leagueId}`);
}

export function getLeagueRosters(leagueId: string): Promise<SleeperRoster[]> {
  return req<SleeperRoster[]>(`/league/${leagueId}/rosters`);
}

export function getLeagueUsers(leagueId: string): Promise<SleeperLeagueUser[]> {
  return req<SleeperLeagueUser[]>(`/league/${leagueId}/users`);
}

export function getNflState(): Promise<SleeperNflState> {
  return req<SleeperNflState>(`/state/nfl`);
}

export function getMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
  return req<SleeperMatchup[]>(`/league/${leagueId}/matchups/${week}`);
}

export function getPlayers(): Promise<Record<string, SleeperPlayer>> {
  return req<Record<string, SleeperPlayer>>(`/players/nfl`);
}

export function fptsTotal(fpts?: number, fptsDecimal?: number): number {
  return (fpts ?? 0) + (fptsDecimal ?? 0) / 100;
}

export function playerDisplayName(id: string, players?: Record<string, SleeperPlayer>): string {
  const p = players?.[id];
  if (!p) return id;
  if (p.full_name) return p.full_name;
  if (p.first_name || p.last_name) return `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
  if (p.team) return `${p.team} Defense`;
  return id;
}

export function playerMeta(id: string, players?: Record<string, SleeperPlayer>): { position: string; team: string } {
  const p = players?.[id];
  return { position: p?.position ?? '—', team: p?.team ?? '—' };
}

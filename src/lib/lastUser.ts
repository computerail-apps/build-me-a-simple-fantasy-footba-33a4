const KEY = 'rosterwatch:lastUser';

export interface LastUser {
  username: string;
  user_id: string;
}

export function getLastUser(): LastUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LastUser) : null;
  } catch {
    return null;
  }
}

export function setLastUser(u: LastUser): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(u));
  } catch {
    // storage unavailable, ignore
  }
}

// Server-side data access for the World Cup bracket challenge.
// All Supabase access for /trouble lives here. Import only from server code
// (route handlers / server components).

import { supabase } from "./supabase";
import {
  ROUNDS,
  type RoundKey,
  type Team,
  type Picks,
  scoreBracket,
} from "./wc-bracket";

export type MatchRow = {
  id: string;
  api_id: number | null;
  round: RoundKey;
  ord: number;
  home: Team | null;
  away: Team | null;
  home_score: number | null;
  away_score: number | null;
  winner_tla: string | null;
  status: string;
  kickoff: string | null;
};

export type Meta = {
  locked: boolean;
  lock_at: string | null;
  last_synced_at: string | null;
};

// Full player record incl. secret password — never send to the client.
export type PlayerRow = {
  id: string;
  username: string;
  password: string;
  bracket_name: string;
  picks: Picks;
  final_goals: number | null;
  submitted: boolean;
  score: number;
  created_at: string;
  updated_at: string;
};

// Safe shape returned to clients (no password).
export type PublicPlayer = {
  id: string;
  username: string;
  bracket_name: string;
  picks: Picks;
  final_goals: number | null;
  submitted: boolean;
  score: number;
  created_at: string;
};

export function toPublic(p: PlayerRow): PublicPlayer {
  return {
    id: p.id,
    username: p.username,
    bracket_name: p.bracket_name,
    picks: p.picks ?? {},
    final_goals: p.final_goals,
    submitted: p.submitted,
    score: p.score,
    created_at: p.created_at,
  };
}

// --- Meta -------------------------------------------------------------------

export async function getMeta(): Promise<Meta> {
  const { data, error } = await supabase
    .from("wc_meta")
    .select("locked, lock_at, last_synced_at")
    .eq("id", 1)
    .single();
  if (error) throw new Error(error.message);
  return data as Meta;
}

export async function updateMeta(patch: Partial<Meta>): Promise<void> {
  const { error } = await supabase.from("wc_meta").update(patch).eq("id", 1);
  if (error) throw new Error(error.message);
}

/** Submissions are closed once manually locked or past the deadline. */
export function isLocked(meta: Meta): boolean {
  if (meta.locked) return true;
  if (meta.lock_at && Date.now() >= new Date(meta.lock_at).getTime()) return true;
  return false;
}

// --- Matches ----------------------------------------------------------------

export async function getMatches(): Promise<MatchRow[]> {
  const { data, error } = await supabase
    .from("wc_matches")
    .select("*")
    .order("round", { ascending: true })
    .order("ord", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as MatchRow[];
}

/** The 16 actual Round-of-32 fixtures, ordered — used to seed the editor. */
export function r32Fixtures(matches: MatchRow[]): { home: Team | null; away: Team | null }[] {
  const r32 = matches
    .filter((m) => m.round === "R32")
    .sort((a, b) => a.ord - b.ord)
    .map((m) => ({ home: m.home, away: m.away }));
  // Pad to 16 so the editor always renders a full bracket.
  while (r32.length < 16) r32.push({ home: null, away: null });
  return r32.slice(0, 16);
}

/** Teams that actually won their match, grouped by round. */
export function actualWinners(matches: MatchRow[]): Partial<Record<RoundKey, string[]>> {
  const out: Partial<Record<RoundKey, string[]>> = {};
  for (const r of ROUNDS) out[r.key] = [];
  for (const m of matches) {
    if (m.winner_tla && out[m.round]) out[m.round]!.push(m.winner_tla);
  }
  return out;
}

/** Actual total goals scored in the final (for the tiebreaker), or null. */
export function finalTotalGoals(matches: MatchRow[]): number | null {
  const final = matches.find(
    (m) => m.round === "F" && m.home_score != null && m.away_score != null
  );
  if (!final) return null;
  return (final.home_score ?? 0) + (final.away_score ?? 0);
}

// --- Players ----------------------------------------------------------------

export async function getAllPlayers(): Promise<PlayerRow[]> {
  const { data, error } = await supabase.from("wc_players").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as PlayerRow[];
}

export async function getPlayerByUsername(username: string): Promise<PlayerRow | null> {
  const { data, error } = await supabase
    .from("wc_players")
    .select("*")
    .ilike("username", username)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as PlayerRow) ?? null;
}

export async function createPlayer(
  username: string,
  password: string,
  bracketName: string
): Promise<PlayerRow> {
  const { data, error } = await supabase
    .from("wc_players")
    .insert({ username, password, bracket_name: bracketName })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as PlayerRow;
}

export async function updatePlayer(
  id: string,
  patch: Partial<Pick<PlayerRow, "bracket_name" | "picks" | "final_goals" | "submitted" | "score">>
): Promise<PlayerRow> {
  const { data, error } = await supabase
    .from("wc_players")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as PlayerRow;
}

/**
 * Recompute and persist every player's score from the current match results.
 * Called after each sync / manual result entry.
 */
export async function recomputeAllScores(): Promise<void> {
  const [players, matches] = await Promise.all([getAllPlayers(), getMatches()]);
  const winners = actualWinners(matches);

  await Promise.all(
    players.map(async (p) => {
      const { total } = scoreBracket(p.picks ?? {}, winners);
      if (total !== p.score) {
        await supabase.from("wc_players").update({ score: total }).eq("id", p.id);
      }
    })
  );
}

/**
 * Leaderboard, sorted by score desc then by the goals tiebreaker (closest
 * predicted final total wins) once the final has been played.
 */
export function leaderboard(players: PublicPlayer[], finalGoals: number | null): PublicPlayer[] {
  return [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (finalGoals != null) {
      const da = a.final_goals == null ? Infinity : Math.abs(a.final_goals - finalGoals);
      const db = b.final_goals == null ? Infinity : Math.abs(b.final_goals - finalGoals);
      if (da !== db) return da - db;
    }
    // Stable-ish fallback: earlier submitters first.
    return a.created_at.localeCompare(b.created_at);
  });
}

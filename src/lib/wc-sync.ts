// Pulls World Cup knockout results from football-data.org and mirrors them
// into the wc_matches table, then triggers a score recompute.
//
// Free tier: https://www.football-data.org/  (competition code "WC")
// Set FOOTBALL_DATA_API_KEY in the environment.

import { supabase } from "./supabase";
import type { Team, RoundKey } from "./wc-bracket";
import { getMatches, recomputeAllScores, updateMeta, type MatchRow } from "./trouble";

const API_BASE = "https://api.football-data.org/v4";

// football-data.org stage names -> our round keys. We map several spellings
// defensively since the 48-team format introduces LAST_32.
const STAGE_MAP: Record<string, RoundKey> = {
  LAST_32: "R32",
  ROUND_OF_32: "R32",
  LAST_16: "R16",
  ROUND_OF_16: "R16",
  QUARTER_FINALS: "QF",
  QUARTER_FINAL: "QF",
  SEMI_FINALS: "SF",
  SEMI_FINAL: "SF",
  FINAL: "F",
};

type ApiTeam = { id?: number; name?: string; shortName?: string; tla?: string; crest?: string } | null;
type ApiMatch = {
  id: number;
  utcDate: string;
  status: string; // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | ...
  stage: string;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score?: {
    winner?: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
    fullTime?: { home: number | null; away: number | null };
    penalties?: { home: number | null; away: number | null };
  };
};

function toTeam(t: ApiTeam): Team | null {
  if (!t || !t.tla) return null; // placeholder fixtures have no tla yet
  return { name: t.shortName || t.name || t.tla, tla: t.tla, crest: t.crest };
}

function normalizeStatus(s: string): string {
  if (s === "FINISHED") return "FINISHED";
  if (s === "IN_PLAY" || s === "PAUSED") return "IN_PLAY";
  return "SCHEDULED";
}

function winnerTla(m: ApiMatch, home: Team | null, away: Team | null): string | null {
  const w = m.score?.winner;
  if (w === "HOME_TEAM") return home?.tla ?? null;
  if (w === "AWAY_TEAM") return away?.tla ?? null;
  // Knockout draw -> decided on penalties.
  const pens = m.score?.penalties;
  if (pens && pens.home != null && pens.away != null) {
    if (pens.home > pens.away) return home?.tla ?? null;
    if (pens.away > pens.home) return away?.tla ?? null;
  }
  return null;
}

export type SyncResult = {
  ok: true;
  fetched: number;
  knockout: number;
  finished: number;
};

export async function syncWorldCup(): Promise<SyncResult> {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) throw new Error("FOOTBALL_DATA_API_KEY is not set");

  const res = await fetch(`${API_BASE}/competitions/WC/matches`, {
    headers: { "X-Auth-Token": key },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`football-data.org responded ${res.status}: ${await res.text()}`);
  }
  const body = (await res.json()) as { matches?: ApiMatch[] };
  const all = body.matches ?? [];

  // Keep only knockout matches we care about.
  const knockout = all.filter((m) => STAGE_MAP[m.stage]);

  // Order within each round by kickoff for a stable `ord` (R32 editor seed order).
  const ordCounter: Record<string, number> = {};
  const byRound = new Map<RoundKey, ApiMatch[]>();
  for (const m of knockout) {
    const r = STAGE_MAP[m.stage];
    if (!byRound.has(r)) byRound.set(r, []);
    byRound.get(r)!.push(m);
  }
  for (const list of byRound.values()) {
    list.sort((a, b) => a.utcDate.localeCompare(b.utcDate) || a.id - b.id);
  }

  // Existing rows so we don't clobber manual overrides with empty API data.
  const existing = await getMatches();
  const byApiId = new Map<number, MatchRow>();
  for (const e of existing) if (e.api_id != null) byApiId.set(e.api_id, e);

  let finished = 0;
  const rows = knockout.map((m) => {
    const round = STAGE_MAP[m.stage];
    const home = toTeam(m.homeTeam);
    const away = toTeam(m.awayTeam);
    const status = normalizeStatus(m.status);
    let winner = winnerTla(m, home, away);
    let homeScore = m.score?.fullTime?.home ?? null;
    let awayScore = m.score?.fullTime?.away ?? null;
    if (status === "FINISHED") finished++;

    // Preserve a manually-entered result if the API hasn't decided yet.
    const prev = byApiId.get(m.id);
    if (!winner && prev?.winner_tla) {
      winner = prev.winner_tla;
      homeScore = prev.home_score;
      awayScore = prev.away_score;
    }

    const ordKey = `${round}`;
    const ord = ordCounter[ordKey] ?? 0;
    ordCounter[ordKey] = ord + 1;

    return {
      api_id: m.id,
      round,
      ord,
      home,
      away,
      home_score: homeScore,
      away_score: awayScore,
      winner_tla: winner,
      status,
      kickoff: m.utcDate,
      updated_at: new Date().toISOString(),
    };
  });

  if (rows.length) {
    const { error } = await supabase
      .from("wc_matches")
      .upsert(rows, { onConflict: "api_id" });
    if (error) throw new Error(error.message);
  }

  await recomputeAllScores();
  await updateMeta({ last_synced_at: new Date().toISOString() });

  return { ok: true, fetched: all.length, knockout: knockout.length, finished };
}

// World Cup knockout bracket topology + ESPN-style scoring.
// Pure functions only — safe to import in both client and server code.
//
// The 2026 World Cup sends 32 teams into the knockout stage:
//   Round of 32 (16 matches) -> Round of 16 (8) -> QF (4) -> SF (2) -> Final (1)
//
// Scoring is "team-advancement" based and ESPN-equivalent: for each round you
// earn the round's points for every team you correctly predicted to win its
// match that round. This deliberately avoids depending on FIFA's exact
// bracket-diagram adjacency (which is brittle to pull from an API). Your own
// predicted matchups are still derived from your picks for display.

export type Team = {
  name: string;
  tla: string; // 3-letter code, e.g. "BRA" — our stable identity for a team
  crest?: string; // flag/crest image URL
};

export type RoundKey = "R32" | "R16" | "QF" | "SF" | "F";

export type RoundDef = {
  key: RoundKey;
  label: string;
  matches: number; // number of matches in this round
  points: number; // points per correct winner
};

export const ROUNDS: RoundDef[] = [
  { key: "R32", label: "Round of 32", matches: 16, points: 10 },
  { key: "R16", label: "Round of 16", matches: 8, points: 20 },
  { key: "QF", label: "Quarterfinals", matches: 4, points: 40 },
  { key: "SF", label: "Semifinals", matches: 2, points: 80 },
  { key: "F", label: "Final", matches: 1, points: 160 },
];

export const MAX_SCORE = ROUNDS.reduce((s, r) => s + r.matches * r.points, 0); // 800

export const TOTAL_PICKS = ROUNDS.reduce((s, r) => s + r.matches, 0); // 31

/** Stable slot key for a (round, match index) pair, e.g. "R32-0", "F-0". */
export function slotKey(round: RoundKey, index: number): string {
  return `${round}-${index}`;
}

export const roundByKey = (key: RoundKey): RoundDef =>
  ROUNDS.find((r) => r.key === key)!;

/** The previous round in the tree (null for R32). */
export function prevRound(key: RoundKey): RoundKey | null {
  const i = ROUNDS.findIndex((r) => r.key === key);
  return i <= 0 ? null : ROUNDS[i - 1].key;
}

export type Picks = Record<string, string>; // slotKey -> winning team tla

/**
 * A match slot as shown in a user's bracket: the two competitors are the
 * winners the user picked in the two feeding slots of the previous round.
 * For R32 the competitors come from the actual fixtures (`seed`).
 */
export type SlotView = {
  key: string;
  round: RoundKey;
  index: number;
  home: Team | null;
  away: Team | null;
  pick: string | null; // tla the user picked to win this slot
};

/**
 * Build the full bracket view for a set of picks. `r32` is the 16 actual
 * Round-of-32 fixtures (ordered). Downstream rounds are derived from picks.
 */
export function buildBracket(
  r32: { home: Team | null; away: Team | null }[],
  picks: Picks
): Record<RoundKey, SlotView[]> {
  const result = {} as Record<RoundKey, SlotView[]>;

  // teamByTla lookup across all known teams so we can render picked winners.
  const teamByTla = new Map<string, Team>();
  for (const m of r32) {
    if (m.home) teamByTla.set(m.home.tla, m.home);
    if (m.away) teamByTla.set(m.away.tla, m.away);
  }

  for (const round of ROUNDS) {
    const slots: SlotView[] = [];
    for (let i = 0; i < round.matches; i++) {
      const key = slotKey(round.key, i);
      let home: Team | null;
      let away: Team | null;

      if (round.key === "R32") {
        home = r32[i]?.home ?? null;
        away = r32[i]?.away ?? null;
      } else {
        const prev = prevRound(round.key)!;
        const homeWinnerTla = picks[slotKey(prev, i * 2)] ?? null;
        const awayWinnerTla = picks[slotKey(prev, i * 2 + 1)] ?? null;
        home = homeWinnerTla ? teamByTla.get(homeWinnerTla) ?? null : null;
        away = awayWinnerTla ? teamByTla.get(awayWinnerTla) ?? null : null;
      }

      slots.push({
        key,
        round: round.key,
        index: i,
        home,
        away,
        pick: picks[key] ?? null,
      });
    }
    result[round.key] = slots;
  }

  return result;
}

/**
 * Remove picks that are no longer reachable. After changing an upstream pick,
 * a downstream slot's chosen winner may no longer be one of its two (newly
 * derived) competitors — those stale picks are dropped. Processes rounds in
 * order so each round sees the already-pruned previous round.
 */
export function prunePicks(picks: Picks): Picks {
  const next: Picks = { ...picks };
  for (const round of ROUNDS) {
    if (round.key === "R32") continue; // R32 competitors are fixed fixtures
    const prev = prevRound(round.key)!;
    for (let i = 0; i < round.matches; i++) {
      const key = slotKey(round.key, i);
      const chosen = next[key];
      if (!chosen) continue;
      const homeTla = next[slotKey(prev, i * 2)];
      const awayTla = next[slotKey(prev, i * 2 + 1)];
      if (chosen !== homeTla && chosen !== awayTla) delete next[key];
    }
  }
  return next;
}

/**
 * A pick set is "complete" when every slot that can be filled is filled.
 * Since downstream slots depend on upstream picks, completeness == all 31
 * slots have a pick (which is only possible once each round is fully chosen).
 */
export function isComplete(picks: Picks): boolean {
  for (const round of ROUNDS) {
    for (let i = 0; i < round.matches; i++) {
      if (!picks[slotKey(round.key, i)]) return false;
    }
  }
  return true;
}

/** Teams the user predicted to WIN their match in a given round. */
export function predictedWinners(picks: Picks, round: RoundKey): string[] {
  const def = roundByKey(round);
  const out: string[] = [];
  for (let i = 0; i < def.matches; i++) {
    const tla = picks[slotKey(round, i)];
    if (tla) out.push(tla);
  }
  return out;
}

/**
 * Score a pick set against the actual winners per round.
 * `actualWinners[round]` = the set of tla's that actually won their match in
 * that round. Returns total points and a per-round breakdown.
 */
export function scoreBracket(
  picks: Picks,
  actualWinners: Partial<Record<RoundKey, string[]>>
): { total: number; breakdown: Record<RoundKey, { correct: number; points: number }> } {
  const breakdown = {} as Record<RoundKey, { correct: number; points: number }>;
  let total = 0;

  for (const round of ROUNDS) {
    const actual = new Set(actualWinners[round.key] ?? []);
    const predicted = predictedWinners(picks, round.key);
    let correct = 0;
    for (const tla of predicted) if (actual.has(tla)) correct++;
    const points = correct * round.points;
    breakdown[round.key] = { correct, points };
    total += points;
  }

  return { total, breakdown };
}

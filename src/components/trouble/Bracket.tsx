"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ROUNDS,
  buildBracket,
  type Picks,
  type RoundKey,
  type Team,
} from "@/lib/wc-bracket";
import type { MatchRow } from "@/lib/trouble";

type Fixture = { home: Team | null; away: Team | null };

interface BracketProps {
  r32: Fixture[];
  picks: Picks;
  matches?: MatchRow[]; // when provided, correct picks are highlighted
  editable?: boolean;
  onPick?: (round: RoundKey, index: number, tla: string) => void;
  captureRef?: React.Ref<HTMLDivElement>; // points at the full-width inner node for JPG export
}

// Crests are pre-loaded into data URLs (via our same-origin proxy) so each
// <img> carries its own isolated image. This avoids html-to-image's image
// cache collapsing every (SVG) crest to the first one in the JPG export.
const crestCache = new Map<string, string>();

function proxyUrl(url: string): string {
  return `/api/trouble/crest?u=${encodeURIComponent(url)}`;
}

function useCrestData(urls: string[]): number {
  const [version, setVersion] = useState(0);
  const key = urls.join("|");

  useEffect(() => {
    let active = true;
    const missing = urls.filter((u) => u && !crestCache.has(u));
    if (missing.length === 0) return;

    Promise.all(
      missing.map(async (u) => {
        try {
          const res = await fetch(proxyUrl(u));
          if (!res.ok) return;
          const blob = await res.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result as string);
            fr.onerror = reject;
            fr.readAsDataURL(blob);
          });
          crestCache.set(u, dataUrl);
        } catch {
          /* leave uncached; falls back to proxy URL on screen */
        }
      })
    ).then(() => active && setVersion((v) => v + 1));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return version;
}

function resolveCrest(url?: string): string | undefined {
  if (!url) return undefined;
  return crestCache.get(url) ?? proxyUrl(url);
}

// Teams that actually won, per round — used to mark correct picks green.
function winnersByRound(matches: MatchRow[] = []): Record<string, Set<string>> {
  const out: Record<string, Set<string>> = {};
  for (const r of ROUNDS) out[r.key] = new Set();
  for (const m of matches) if (m.winner_tla) out[m.round]?.add(m.winner_tla);
  return out;
}

function TeamRow({
  team,
  picked,
  hit,
  played,
  clickable,
  onClick,
}: {
  team: Team | null;
  picked: boolean;
  hit: boolean;
  played: boolean;
  clickable: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!clickable || !team}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs transition-colors",
        clickable && team && "cursor-pointer hover:bg-zinc-100",
        picked && !played && "bg-cBlue/20 font-semibold",
        picked && played && hit && "bg-cGreen/30 font-semibold",
        picked && played && !hit && "bg-red-100 font-semibold line-through",
        !team && "opacity-40"
      )}
    >
      {team?.crest ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolveCrest(team.crest)} alt="" className="h-4 w-4 shrink-0 object-contain" />
      ) : (
        <span className="h-4 w-4 shrink-0 rounded-sm bg-zinc-200" />
      )}
      <span className="truncate">{team ? team.name : "—"}</span>
      {team && <span className="ml-auto text-[10px] text-zinc-400">{team.tla}</span>}
    </button>
  );
}

export default function Bracket({ r32, picks, matches, editable, onPick, captureRef }: BracketProps) {
  const bracket = buildBracket(r32, picks);
  const winners = winnersByRound(matches);

  // Pre-load every crest into a data URL so the JPG export renders them all.
  const crestUrls = Array.from(
    new Set(
      r32.flatMap((m) => [m.home?.crest, m.away?.crest]).filter(Boolean) as string[]
    )
  );
  useCrestData(crestUrls);

  return (
    <div className="overflow-x-auto pb-4">
      <div ref={captureRef} className="flex gap-4 bg-white p-4" style={{ minWidth: "max-content" }}>
        {ROUNDS.map((round) => {
          const roundWinners = winners[round.key];
          const roundPlayed = roundWinners.size > 0;
          return (
            <div key={round.key} className="flex w-44 shrink-0 flex-col gap-3">
              <div className="sticky top-0 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-cBlack">
                  {round.label}
                </p>
                <p className="text-[10px] text-zinc-400">{round.points} pts each</p>
              </div>
              <div
                className="flex flex-1 flex-col justify-around gap-2"
              >
                {bracket[round.key].map((slot) => {
                  const homePicked = slot.pick != null && slot.home?.tla === slot.pick;
                  const awayPicked = slot.pick != null && slot.away?.tla === slot.pick;
                  return (
                    <div
                      key={slot.key}
                      className="border border-zinc-300 bg-white divide-y divide-zinc-200"
                    >
                      <TeamRow
                        team={slot.home}
                        picked={homePicked}
                        hit={homePicked && roundWinners.has(slot.home!.tla)}
                        played={roundPlayed}
                        clickable={Boolean(editable)}
                        onClick={() =>
                          slot.home && onPick?.(round.key, slot.index, slot.home.tla)
                        }
                      />
                      <TeamRow
                        team={slot.away}
                        picked={awayPicked}
                        hit={awayPicked && roundWinners.has(slot.away!.tla)}
                        played={roundPlayed}
                        clickable={Boolean(editable)}
                        onClick={() =>
                          slot.away && onPick?.(round.key, slot.index, slot.away.tla)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

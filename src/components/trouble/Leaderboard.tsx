"use client";

import { cn } from "@/lib/utils";
import type { PublicPlayer } from "@/lib/trouble";

interface LeaderboardProps {
  players: PublicPlayer[];
  maxScore: number;
  currentPlayerId?: string;
  onView: (player: PublicPlayer) => void;
}

export default function Leaderboard({
  players,
  maxScore,
  currentPlayerId,
  onView,
}: LeaderboardProps) {
  if (players.length === 0) {
    return <p className="text-center text-sm text-zinc-400">No brackets yet. Be the first.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-2">
      {players.map((p, i) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onView(p)}
          className={cn(
            "flex w-full items-center gap-3 border border-zinc-300 bg-white px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card",
            p.id === currentPlayerId && "border-cBlack bg-cBlue/10"
          )}
        >
          <span className="w-6 text-center text-sm font-bold text-zinc-400">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-cBlack">
              {p.bracket_name || `${p.username}'s bracket`}
            </p>
            <p className="truncate text-xs text-zinc-400">
              @{p.username}
              {!p.submitted && " · draft"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-cBlack">{p.score}</p>
            <p className="text-[10px] text-zinc-400">/ {maxScore}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

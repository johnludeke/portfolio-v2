"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ROUNDS } from "@/lib/wc-bracket";
import type { MatchRow, Meta } from "@/lib/trouble";

interface AdminPanelProps {
  meta: Meta & { effectiveLocked?: boolean };
  matches: MatchRow[];
  onChanged: () => void;
}

export default function AdminPanel({ meta, matches, onChanged }: AdminPanelProps) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [lockAt, setLockAt] = useState(
    meta.lock_at ? toLocalInput(meta.lock_at) : ""
  );

  async function call(url: string, body: unknown) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error ?? "Failed (are you signed in as admin?)");
      } else {
        setMsg("Saved.");
        onChanged();
      }
    } catch {
      setMsg("Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="mx-auto mt-10 w-full max-w-2xl border border-zinc-300 bg-white">
      <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-cBlack">
        Owner tools
      </summary>
      <div className="space-y-5 border-t border-zinc-200 p-3">
        {msg && <p className="text-xs text-zinc-500">{msg}</p>}

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-zinc-400">Lock</p>
          <div className="flex flex-wrap items-end gap-2">
            <Button
              size="sm"
              variant={meta.locked ? "danger" : "secondary"}
              loading={busy}
              onClick={() => call("/api/trouble/admin", { action: "lock", locked: !meta.locked })}
            >
              {meta.locked ? "Unlock submissions" : "Lock submissions now"}
            </Button>
            <div className="flex items-end gap-2">
              <Input
                label="Deadline"
                type="datetime-local"
                value={lockAt}
                onChange={(e) => setLockAt(e.target.value)}
              />
              <Button
                size="sm"
                variant="secondary"
                loading={busy}
                onClick={() =>
                  call("/api/trouble/admin", {
                    action: "lockAt",
                    lockAt: lockAt ? new Date(lockAt).toISOString() : null,
                  })
                }
              >
                Set
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">
            Currently {meta.effectiveLocked ? "LOCKED" : "open"}.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-zinc-400">
            Arrange Round of 32 (bracket order)
          </p>
          <p className="text-[11px] text-zinc-400">
            Set each match&apos;s position 1–16 top-to-bottom to match the official
            bracket. Winner of 1 plays winner of 2, 3 plays 4, etc. — this makes
            everyone&apos;s downstream matchups accurate.
          </p>
          {matches.filter((m) => m.round === "R32").length === 0 && (
            <p className="text-[11px] text-zinc-400">Sync first to load fixtures.</p>
          )}
          {[...matches.filter((m) => m.round === "R32")]
            .sort((a, b) => a.ord - b.ord)
            .map((m) => (
              <R32OrderRow key={m.id} match={m} onSave={call} busy={busy} />
            ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-zinc-400">Results</p>
          <Button
            size="sm"
            loading={busy}
            onClick={() => call("/api/trouble/sync", {})}
          >
            Sync from football-data.org
          </Button>
          {matches.length === 0 && (
            <p className="text-[11px] text-zinc-400">
              No matches yet — run a sync once the knockout fixtures are set.
            </p>
          )}
          {ROUNDS.map((round) => {
            const rows = matches.filter((m) => m.round === round.key);
            if (rows.length === 0) return null;
            return (
              <div key={round.key} className="space-y-1">
                <p className="text-[11px] font-semibold text-zinc-500">{round.label}</p>
                {rows.map((m) => (
                  <MatchResultRow key={m.id} match={m} onSave={call} busy={busy} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}

function R32OrderRow({
  match,
  onSave,
  busy,
}: {
  match: MatchRow;
  onSave: (url: string, body: unknown) => void;
  busy: boolean;
}) {
  const [pos, setPos] = useState(String(match.ord + 1));

  return (
    <div className="flex items-center gap-2 text-xs">
      <input
        type="number"
        min={1}
        max={16}
        className="w-12 border border-zinc-300 px-1 py-0.5"
        value={pos}
        onChange={(e) => setPos(e.target.value)}
      />
      <span className="flex-1 truncate">
        {match.home?.name ?? "TBD"} v {match.away?.name ?? "TBD"}
      </span>
      <Button
        size="sm"
        variant="secondary"
        loading={busy}
        onClick={() =>
          onSave("/api/trouble/admin", {
            action: "order",
            matchId: match.id,
            ord: Math.max(0, (Number(pos) || 1) - 1),
          })
        }
      >
        Set
      </Button>
    </div>
  );
}

function MatchResultRow({
  match,
  onSave,
  busy,
}: {
  match: MatchRow;
  onSave: (url: string, body: unknown) => void;
  busy: boolean;
}) {
  const [home, setHome] = useState(match.home_score?.toString() ?? "");
  const [away, setAway] = useState(match.away_score?.toString() ?? "");
  const [winner, setWinner] = useState(match.winner_tla ?? "");

  const homeTla = match.home?.tla;
  const awayTla = match.away?.tla;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="w-28 truncate">
        {match.home?.name ?? "TBD"} v {match.away?.name ?? "TBD"}
      </span>
      <input
        className="w-10 border border-zinc-300 px-1 py-0.5"
        value={home}
        onChange={(e) => setHome(e.target.value)}
        placeholder="–"
      />
      <input
        className="w-10 border border-zinc-300 px-1 py-0.5"
        value={away}
        onChange={(e) => setAway(e.target.value)}
        placeholder="–"
      />
      <select
        className="border border-zinc-300 px-1 py-0.5"
        value={winner}
        onChange={(e) => setWinner(e.target.value)}
      >
        <option value="">winner…</option>
        {homeTla && <option value={homeTla}>{homeTla}</option>}
        {awayTla && <option value={awayTla}>{awayTla}</option>}
      </select>
      <Button
        size="sm"
        variant="secondary"
        loading={busy}
        onClick={() =>
          onSave("/api/trouble/admin", {
            action: "result",
            matchId: match.id,
            homeScore: home === "" ? null : Number(home),
            awayScore: away === "" ? null : Number(away),
            winnerTla: winner || null,
          })
        }
      >
        Save
      </Button>
    </div>
  );
}

// "2026-07-19T18:00:00Z" -> value for <input type="datetime-local">
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

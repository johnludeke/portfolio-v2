"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toJpeg } from "html-to-image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import {
  prunePicks,
  isComplete,
  type Picks,
  type RoundKey,
  type Team,
} from "@/lib/wc-bracket";
import type { MatchRow, Meta, PublicPlayer } from "@/lib/trouble";
import AuthPanel from "./AuthPanel";
import Bracket from "./Bracket";
import Leaderboard from "./Leaderboard";
import AdminPanel from "./AdminPanel";

type Fixture = { home: Team | null; away: Team | null };
type Data = {
  meta: Meta & { effectiveLocked: boolean };
  matches: MatchRow[];
  r32: Fixture[];
  players: PublicPlayer[];
  actualFinalGoals: number | null;
  maxScore: number;
  isAdmin: boolean;
};
type Auth = { username: string; password: string; playerId: string };

const AUTH_KEY = "trouble_auth";

export default function TroubleApp() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [auth, setAuth] = useState<Auth | null>(null);
  const [tab, setTab] = useState<"bracket" | "leaderboard">("bracket");
  const [viewing, setViewing] = useState<PublicPlayer | null>(null);

  // editor state
  const [picks, setPicks] = useState<Picks>({});
  const [bracketName, setBracketName] = useState("");
  const [finalGoals, setFinalGoals] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [exporting, setExporting] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/trouble/data", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      setData(await res.json());
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(AUTH_KEY) : null;
    if (raw) {
      try {
        setAuth(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
    refetch();
  }, [refetch]);

  const me = data && auth ? data.players.find((p) => p.id === auth.playerId) ?? null : null;

  // (Re)initialize the editor whenever the active player changes.
  useEffect(() => {
    if (me) {
      setPicks(me.picks ?? {});
      setBracketName(me.bracket_name ?? "");
      setFinalGoals(me.final_goals != null ? String(me.final_goals) : "");
    }
  }, [me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function onAuth(creds: { username: string; password: string }, player: PublicPlayer) {
    const next: Auth = { ...creds, playerId: player.id };
    localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    setAuth(next);
    refetch();
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    setAuth(null);
    setPicks({});
  }

  function onPick(round: RoundKey, index: number, tla: string) {
    setPicks((prev) => prunePicks({ ...prev, [`${round}-${index}`]: tla }));
    setSaveMsg("");
  }

  async function save(submit: boolean) {
    if (!auth) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/trouble/bracket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: auth.username,
          password: auth.password,
          picks,
          bracketName,
          finalGoals: finalGoals === "" ? null : Number(finalGoals),
          submit,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveMsg(body.error ?? "Failed to save");
        return;
      }
      setSaveMsg(submit ? "Submitted! Good luck." : "Draft saved.");
      await refetch();
    } catch {
      setSaveMsg("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function saveJpg(name: string) {
    const node = captureRef.current;
    if (!node) return;
    setExporting(true);
    try {
      const dataUrl = await toJpeg(node, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: node.scrollWidth,
        height: node.scrollHeight,
        cacheBust: true,
        // Cross-origin crests that block CORS fall back to a transparent pixel
        // instead of failing the whole export.
        imagePlaceholder:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      });
      const link = document.createElement("a");
      link.download = `${name.replace(/[^a-z0-9-_]+/gi, "_") || "bracket"}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch {
      /* ignore export errors */
    } finally {
      setExporting(false);
    }
  }

  if (error) {
    return <Shell><p className="text-center text-sm text-red-600">{error}</p></Shell>;
  }
  if (!data) {
    return <Shell><p className="text-center text-sm text-zinc-400">Loading…</p></Shell>;
  }

  const locked = data.meta.effectiveLocked;
  const canEdit = Boolean(me) && !me!.submitted && !locked;

  return (
    <Shell>
      {/* Tabs */}
      <div className="mb-6 flex items-center justify-center gap-1">
        <TabButton active={tab === "bracket"} onClick={() => { setTab("bracket"); setViewing(null); }}>
          My bracket
        </TabButton>
        <TabButton active={tab === "leaderboard"} onClick={() => { setTab("leaderboard"); setViewing(null); }}>
          Leaderboard
        </TabButton>
      </div>

      {locked && (
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-cOrange">
          Submissions are locked
        </p>
      )}
      {!locked && data.meta.lock_at && (
        <p className="mb-4 text-center text-xs text-zinc-400">
          Locks {new Date(data.meta.lock_at).toLocaleString()}
        </p>
      )}

      {tab === "bracket" && (
        <>
          {!me ? (
            <AuthPanel onAuth={onAuth} />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-zinc-400">
                    @{me.username} · score {me.score}/{data.maxScore}
                    {me.submitted && " · submitted"}
                  </p>
                </div>
                <button onClick={logout} className="text-xs text-zinc-400 underline">
                  log out
                </button>
              </div>

              {canEdit ? (
                <>
                  <Input
                    label="Bracket name"
                    value={bracketName}
                    onChange={(e) => setBracketName(e.target.value)}
                    placeholder="name your bracket"
                  />
                  <Bracket r32={data.r32} picks={picks} editable onPick={onPick} matches={data.matches} captureRef={captureRef} />
                  <div className="flex flex-wrap items-end gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => saveJpg(bracketName || me.username)}
                      loading={exporting}
                    >
                      Save as JPG
                    </Button>
                    <Input
                      label="Tiebreaker: total goals in the final"
                      type="number"
                      min={0}
                      className="w-28"
                      value={finalGoals}
                      onChange={(e) => setFinalGoals(e.target.value)}
                    />
                    <Button variant="secondary" onClick={() => save(false)} loading={saving}>
                      Save draft
                    </Button>
                    <Button
                      onClick={() => save(true)}
                      loading={saving}
                      disabled={!isComplete(picks) || finalGoals === ""}
                    >
                      Submit (final)
                    </Button>
                  </div>
                  {!isComplete(picks) && (
                    <p className="text-[11px] text-zinc-400">
                      Pick every match (through the champion) to enable submit.
                    </p>
                  )}
                  {saveMsg && <p className="text-xs text-zinc-500">{saveMsg}</p>}
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-cBlack">
                      {me.bracket_name || `${me.username}'s bracket`}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => saveJpg(me.bracket_name || me.username)}
                      loading={exporting}
                    >
                      Save as JPG
                    </Button>
                  </div>
                  <Bracket r32={data.r32} picks={me.picks} matches={data.matches} captureRef={captureRef} />
                  {saveMsg && <p className="text-xs text-zinc-500">{saveMsg}</p>}
                </>
              )}
            </div>
          )}
        </>
      )}

      {tab === "leaderboard" && (
        <>
          {viewing ? (
            <div className="space-y-3">
              <button onClick={() => setViewing(null)} className="text-xs text-zinc-400 underline">
                ← back to leaderboard
              </button>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-cBlack">
                  {viewing.bracket_name || `${viewing.username}'s bracket`}{" "}
                  <span className="text-zinc-400">· {viewing.score}/{data.maxScore}</span>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => saveJpg(viewing.bracket_name || viewing.username)}
                  loading={exporting}
                >
                  Save as JPG
                </Button>
              </div>
              <Bracket r32={data.r32} picks={viewing.picks} matches={data.matches} captureRef={captureRef} />
            </div>
          ) : (
            <Leaderboard
              players={data.players}
              maxScore={data.maxScore}
              currentPlayerId={me?.id}
              onView={setViewing}
            />
          )}
        </>
      )}

      {data.isAdmin && (
        <AdminPanel meta={data.meta} matches={data.matches} onChanged={refetch} />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <h1 className="font-script text-5xl text-cBlack">trouble</h1>
          <p className="text-sm text-zinc-500">World Cup bracket challenge</p>
        </header>
        {children}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors",
        active ? "border-b-2 border-cBlack text-cBlack" : "text-zinc-400 hover:text-cBlack"
      )}
    >
      {children}
    </button>
  );
}

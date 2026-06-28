import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/trouble-server";
import { supabase } from "@/lib/supabase";
import { recomputeAllScores, updateMeta } from "@/lib/trouble";

// Owner-only controls (Google admin session required):
//   { action: "lock", locked }                         -> hard lock toggle
//   { action: "lockAt", lockAt }                        -> set/clear deadline
//   { action: "result", matchId, homeScore, awayScore, winnerTla } -> manual result
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    action?: string;
    locked?: boolean;
    lockAt?: string | null;
    matchId?: string;
    ord?: number;
    homeScore?: number | null;
    awayScore?: number | null;
    winnerTla?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    switch (body.action) {
      case "lock":
        await updateMeta({ locked: Boolean(body.locked) });
        return NextResponse.json({ ok: true });

      case "lockAt":
        await updateMeta({ lock_at: body.lockAt ?? null });
        return NextResponse.json({ ok: true });

      case "order": {
        if (!body.matchId) {
          return NextResponse.json({ error: "matchId required" }, { status: 400 });
        }
        const { error } = await supabase
          .from("wc_matches")
          .update({ ord: body.ord ?? 0, updated_at: new Date().toISOString() })
          .eq("id", body.matchId);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }

      case "result": {
        if (!body.matchId) {
          return NextResponse.json({ error: "matchId required" }, { status: 400 });
        }
        const winner = body.winnerTla || null;
        const { error } = await supabase
          .from("wc_matches")
          .update({
            home_score: body.homeScore ?? null,
            away_score: body.awayScore ?? null,
            winner_tla: winner,
            status: winner ? "FINISHED" : "SCHEDULED",
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.matchId);
        if (error) throw new Error(error.message);
        await recomputeAllScores();
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

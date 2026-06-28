import { NextResponse } from "next/server";
import { hasGate } from "@/lib/trouble-server";
import {
  getMeta,
  getMatches,
  getAllPlayers,
  toPublic,
  r32Fixtures,
  finalTotalGoals,
  leaderboard,
  isLocked,
} from "@/lib/trouble";
import { MAX_SCORE } from "@/lib/wc-bracket";

// GET -> everything the client needs to render the challenge.
export async function GET() {
  if (!(await hasGate())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }

  try {
    const [meta, matches, players] = await Promise.all([
      getMeta(),
      getMatches(),
      getAllPlayers(),
    ]);

    const finalGoals = finalTotalGoals(matches);
    const publicPlayers = players.map(toPublic);

    return NextResponse.json({
      meta: { ...meta, effectiveLocked: isLocked(meta) },
      matches,
      r32: r32Fixtures(matches),
      players: leaderboard(publicPlayers, finalGoals),
      actualFinalGoals: finalGoals,
      maxScore: MAX_SCORE,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

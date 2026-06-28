import { NextRequest, NextResponse } from "next/server";
import { hasGate } from "@/lib/trouble-server";
import {
  getPlayerByUsername,
  getMeta,
  isLocked,
  getMatches,
  actualWinners,
  updatePlayer,
  toPublic,
} from "@/lib/trouble";
import { isComplete, scoreBracket, type Picks } from "@/lib/wc-bracket";

// POST { username, password, picks, bracketName?, finalGoals?, submit }
// Saves a draft (submit=false) or finalizes (submit=true). A submitted
// bracket can no longer be edited, and nothing can be saved once locked.
export async function POST(req: NextRequest) {
  if (!(await hasGate())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }

  let body: {
    username?: string;
    password?: string;
    picks?: Picks;
    bracketName?: string;
    finalGoals?: number | null;
    submit?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const username = (body.username ?? "").trim();
  const player = await getPlayerByUsername(username);
  if (!player || player.password !== (body.password ?? "")) {
    return NextResponse.json({ error: "Wrong username or password" }, { status: 401 });
  }

  const meta = await getMeta();
  if (isLocked(meta)) {
    return NextResponse.json({ error: "Submissions are locked" }, { status: 403 });
  }
  if (player.submitted) {
    return NextResponse.json({ error: "Your bracket is already submitted and can't be edited" }, { status: 403 });
  }

  const picks = body.picks ?? {};
  const submit = Boolean(body.submit);
  const finalGoals =
    body.finalGoals == null || Number.isNaN(Number(body.finalGoals))
      ? null
      : Math.max(0, Math.min(50, Math.round(Number(body.finalGoals))));

  if (submit) {
    if (!isComplete(picks)) {
      return NextResponse.json({ error: "Fill out every match before submitting" }, { status: 400 });
    }
    if (finalGoals == null) {
      return NextResponse.json({ error: "Enter a total-goals tiebreaker before submitting" }, { status: 400 });
    }
  }

  // Score against whatever results already exist (usually 0 before kickoff).
  const matches = await getMatches();
  const { total } = scoreBracket(picks, actualWinners(matches));

  const bracketName =
    body.bracketName != null ? (body.bracketName.trim() || player.bracket_name).slice(0, 60) : player.bracket_name;

  const updated = await updatePlayer(player.id, {
    picks,
    bracket_name: bracketName,
    final_goals: finalGoals,
    submitted: submit || player.submitted,
    score: total,
  });

  return NextResponse.json({ player: toPublic(updated) });
}

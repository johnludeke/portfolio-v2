import { NextRequest, NextResponse } from "next/server";
import { hasGate } from "@/lib/trouble-server";
import {
  createPlayer,
  getPlayerByUsername,
  toPublic,
} from "@/lib/trouble";

// POST { action: "register" | "login", username, password, bracketName? }
// Returns the public player record. Identity is not a secure session — the
// client keeps username+password and re-sends them on writes (by design).
export async function POST(req: NextRequest) {
  if (!(await hasGate())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }

  let body: { action?: string; username?: string; password?: string; bracketName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const action = body.action;
  const username = (body.username ?? "").trim();
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }
  if (username.length > 30) {
    return NextResponse.json({ error: "Username too long (max 30)" }, { status: 400 });
  }

  if (action === "register") {
    const existing = await getPlayerByUsername(username);
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
    const bracketName = (body.bracketName ?? "").trim() || `${username}'s bracket`;
    const player = await createPlayer(username, password, bracketName.slice(0, 60));
    return NextResponse.json({ player: toPublic(player) }, { status: 201 });
  }

  if (action === "login") {
    const player = await getPlayerByUsername(username);
    if (!player || player.password !== password) {
      return NextResponse.json({ error: "Wrong username or password" }, { status: 401 });
    }
    return NextResponse.json({ player: toPublic(player) });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

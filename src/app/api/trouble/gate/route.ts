import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE } from "@/lib/trouble-server";

// POST { password } -> sets the gate cookie if the shared password is correct.
export async function POST(req: NextRequest) {
  const expected = process.env.TROUBLE_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "Gate not configured" }, { status: 500 });
  }

  let password = "";
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const store = await cookies();
  store.set(GATE_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60, // 60 days
  });

  return NextResponse.json({ ok: true });
}

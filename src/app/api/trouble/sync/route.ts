import { NextRequest, NextResponse } from "next/server";
import { isAdmin, isCron } from "@/lib/trouble-server";
import { syncWorldCup } from "@/lib/wc-sync";

// Pulls results from football-data.org and recomputes scores.
// Allowed for the Vercel cron (CRON_SECRET) or the site owner (admin session).
async function run(req: NextRequest) {
  if (!isCron(req) && !(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncWorldCup();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export const GET = run; // Vercel cron issues GET requests
export const POST = run; // manual "sync now" from the admin UI

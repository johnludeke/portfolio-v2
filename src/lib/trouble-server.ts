// Shared auth helpers for the /trouble route handlers.

import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export const GATE_COOKIE = "trouble_gate";

/** True if the visitor has passed the shared friends-only gate password. */
export async function hasGate(): Promise<boolean> {
  const store = await cookies();
  return store.get(GATE_COOKIE)?.value === "1";
}

/** True if the request is from the site owner (Google admin session). */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return Boolean(session);
}

/** True if the request carries the Vercel cron secret. */
export function isCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

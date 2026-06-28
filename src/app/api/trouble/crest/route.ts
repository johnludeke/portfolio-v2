import { NextRequest, NextResponse } from "next/server";

// Same-origin proxy for team crests so the JPG export (html-to-image) can
// read them — cross-origin crests from football-data.org block CORS and would
// otherwise come out blank. Restricted to football-data hosts (no open proxy).
const ALLOWED_HOSTS = new Set([
  "crests.football-data.org",
  "football-data.org",
  "www.football-data.org",
]);

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) return new NextResponse("missing u", { status: 400 });

  let url: URL;
  try {
    url = new URL(u);
  } catch {
    return new NextResponse("bad url", { status: 400 });
  }
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    return new NextResponse("forbidden host", { status: 403 });
  }

  const upstream = await fetch(url.toString(), { cache: "force-cache" });
  if (!upstream.ok) return new NextResponse("upstream error", { status: 502 });

  const contentType = upstream.headers.get("content-type") ?? "image/png";
  const body = await upstream.arrayBuffer();
  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}

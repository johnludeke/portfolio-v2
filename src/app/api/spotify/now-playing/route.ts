import { NextResponse } from "next/server";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
    }),
  });

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000; // refresh 60s early
  return cachedToken!;
}

export async function GET() {
  try {
    const access_token = await getAccessToken();
    const res = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
      next: { revalidate: 0 },
    });

    if (res.status === 204 || res.status > 400) {
      return NextResponse.json({ isPlaying: false });
    }

    const data = await res.json();
    const type = data.currently_playing_type;

    if (type === "track") {
      return NextResponse.json({
        isPlaying: data.is_playing,
        title: data.item.name,
        artist: data.item.artists
          .map((a: { name: string }) => a.name)
          .join(", "),
        albumImageUrl: data.item.album.images[0].url,
        songUrl: data.item.external_urls.spotify,
      });
    } else if (type === "episode") {
      return NextResponse.json({
        isPlaying: data.is_playing,
        title: data.item.name,
        artist: data.item.show.name,
        albumImageUrl: data.item.show.images[0].url,
        songUrl: data.item.external_urls.spotify,
      });
    }

    return NextResponse.json({ isPlaying: false });
  } catch {
    return NextResponse.json({ isPlaying: false });
  }
}

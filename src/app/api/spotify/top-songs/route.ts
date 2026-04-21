import { NextResponse } from "next/server";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const TOP_SONGS_ENDPOINT =
  "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=3";

async function getAccessToken(): Promise<string> {
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
  return data.access_token;
}

export async function GET() {
  try {
    const access_token = await getAccessToken();
    const res = await fetch(TOP_SONGS_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
      next: { revalidate: 3600 },
    });

    if (res.status > 400) {
      return NextResponse.json({ tracks: [] });
    }

    const data = await res.json();
    const tracks = data.items.map(
      (track: {
        name: string;
        artists: { name: string }[];
        album: { images: { url: string }[] };
        external_urls: { spotify: string };
      }) => ({
        title: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        albumImageUrl: track.album.images[0].url,
        songUrl: track.external_urls.spotify,
      })
    );

    return NextResponse.json({ tracks });
  } catch {
    return NextResponse.json({ tracks: [] });
  }
}

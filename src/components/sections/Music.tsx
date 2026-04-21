"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PlayingAnimation from "@/components/spotify/PlayingAnimation";

interface NowPlayingData {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  albumImageUrl?: string;
  songUrl?: string;
}

interface Track {
  title: string;
  artist: string;
  albumImageUrl: string;
  songUrl: string;
}

export default function Music() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [topTracks, setTopTracks] = useState<Track[]>([]);

  useEffect(() => {
    const pollNowPlaying = async () => {
      try {
        const res = await fetch("/api/spotify/now-playing");
        setNowPlaying(await res.json());
      } catch {}
    };

    pollNowPlaying();
    const id = setInterval(pollNowPlaying, 10_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/spotify/top-songs")
      .then((r) => r.json())
      .then((d) => setTopTracks(d.tracks ?? []));
  }, []);

  return (
    <section className="bg-white py-12 border-t border-zinc-100">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Now Playing */}
          <div>
            <p className="text-xs font-mono font-semibold text-cBlack tracking-widest uppercase mb-4">
              Live Spotify
            </p>

            {nowPlaying === null ? null : nowPlaying.isPlaying &&
              nowPlaying.albumImageUrl ? (
              <a
                href={nowPlaying.songUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 border border-zinc-200 h-20 md:h-36 hover:border-zinc-400 transition-colors overflow-hidden"
              >
                <div className="relative h-full w-20 md:w-28 shrink-0">
                  <Image
                    src={nowPlaying.albumImageUrl}
                    alt={nowPlaying.title ?? ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-sm font-semibold text-cBlack truncate group-hover:opacity-60 transition-opacity">
                    {nowPlaying.title}
                  </p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {nowPlaying.artist}
                  </p>
                </div>
                <div className="shrink-0 pr-4">
                  <PlayingAnimation />
                </div>
              </a>
            ) : (
              <div className="flex items-center gap-3 border border-zinc-200 h-20 md:h-36 px-4">
                <div className="w-[12px] h-[3px] bg-[#1ED760] rounded-full shrink-0" />
                <p className="text-sm text-zinc-400">Not listening right now</p>
              </div>
            )}
          </div>

          {/* Top Tracks */}
          {topTracks.length > 0 && (
            <div>
              <p className="text-xs font-mono font-semibold text-cBlack tracking-widest uppercase mb-4">
                Top This Month
              </p>
              <div className="flex flex-col gap-3">
                {topTracks.map((track, i) => (
                  <a
                    key={track.title}
                    href={track.songUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3"
                  >
                    <span className="text-xs font-mono text-zinc-300 w-4 text-right shrink-0">
                      {i + 1}
                    </span>
                    <div className="relative w-10 h-10 shrink-0">
                      <Image
                        src={track.albumImageUrl}
                        alt={track.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-cBlack truncate group-hover:opacity-60 transition-opacity">
                        {track.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

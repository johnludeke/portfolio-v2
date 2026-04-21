"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Track {
  title: string;
  artist: string;
  albumImageUrl: string;
  songUrl: string;
}

const CARD_W = 280;

export default function TopSongs() {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    fetch("/api/spotify/top-songs")
      .then((r) => r.json())
      .then((d) => setTracks(d.tracks ?? []));
  }, []);

  if (!tracks.length) return null;

  return (
    <div className="flex flex-col gap-2 mt-4">
      {tracks.map((track, i) => (
        <div key={track.title} className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-400 w-4 text-right flex-shrink-0">
            {i + 1}
          </span>
          <a
            href={track.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group h-12 border border-zinc-200 flex items-center overflow-hidden hover:border-zinc-400 transition-colors"
            style={{ width: CARD_W }}
          >
            <div className="h-full w-12 shrink-0 relative">
              <Image src={track.albumImageUrl} alt={track.title} fill className="object-cover" />
            </div>
            <div className="flex flex-col px-3 min-w-0">
              <span className="text-sm font-semibold text-cBlack truncate group-hover:opacity-60 transition-opacity">
                {track.title}
              </span>
              <span className="text-xs text-zinc-400 truncate">{track.artist}</span>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}

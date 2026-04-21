"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PlayingAnimation from "./PlayingAnimation";

interface NowPlayingData {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  albumImageUrl?: string;
  songUrl?: string;
}

const CARD_W = 280;

export default function NowPlaying() {
  const [data, setData] = useState<NowPlayingData | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/spotify/now-playing");
        setData(await res.json());
      } catch {
        // keep previous state on error
      }
    };

    poll();
    const id = setInterval(poll, 10_000);
    return () => clearInterval(id);
  }, []);

  if (!data) return null;

  const inner = data.isPlaying && data.albumImageUrl ? (
    <>
      <div className="h-full w-14 flex-shrink-0 relative">
        <Image src={data.albumImageUrl} alt={data.title ?? ""} fill className="object-cover" />
      </div>
      <div className="flex flex-col px-3 min-w-0">
        <span className="text-sm font-semibold text-cBlack truncate group-hover:opacity-60 transition-opacity">
          {data.title}
        </span>
        <span className="text-xs text-zinc-400 truncate">{data.artist}</span>
      </div>
    </>
  ) : (
    <div className="px-4 flex flex-col">
      <span className="text-sm font-semibold text-cBlack">Not playing</span>
      <span className="text-xs text-zinc-400">Check back later</span>
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      <div className="w-[13px] h-[13px] flex-shrink-0">
        {data.isPlaying ? (
          <PlayingAnimation />
        ) : (
          <div className="w-[12px] h-[3px] mt-[5px] bg-[#1ED760] rounded-full" />
        )}
      </div>

      {data.isPlaying && data.songUrl ? (
        <a
          href={data.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group h-14 border border-zinc-200 flex items-center overflow-hidden hover:border-zinc-400 transition-colors"
          style={{ width: CARD_W }}
        >
          {inner}
        </a>
      ) : (
        <div
          className="h-14 border border-zinc-200 flex items-center overflow-hidden"
          style={{ width: CARD_W }}
        >
          {inner}
        </div>
      )}
    </div>
  );
}

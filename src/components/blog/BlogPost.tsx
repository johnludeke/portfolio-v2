import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { BlogPost as BlogPostType } from "@/lib/types";
import MarkdownRenderer from "./MarkdownRenderer";

interface BlogPostProps {
  post: BlogPostType;
  html: string;
}

function YouTubeEmbed({ url }: { url: string }) {
  // Extract video ID from various YouTube URL formats
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (!match) return null;
  const videoId = match[1];

  return (
    <div className="relative w-full aspect-video my-8">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}

function SpotifyEmbed({ url }: { url: string }) {
  // Convert share URL to embed URL
  const embedUrl = url
    .replace("open.spotify.com/", "open.spotify.com/embed/")
    .replace(/\?.*$/, "");

  return (
    <div className="my-8">
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="border-0"
      />
    </div>
  );
}

export default function BlogPost({ post, html }: BlogPostProps) {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      {/* Header */}
      <header className="mb-10">
        <time className="text-sm text-zinc-400 font-mono">
          {formatDate(post.publishDate || post.createdAt)}
        </time>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-cBlack leading-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-4 text-lg text-zinc-500 leading-relaxed">{post.excerpt}</p>
        )}
      </header>

      {/* Thumbnail */}
      {post.thumbnail && (
        <div className="relative w-full aspect-video mb-10 overflow-hidden bg-zinc-100">
          <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
        </div>
      )}

      {/* Media embeds */}
      {post.youtubeUrl && <YouTubeEmbed url={post.youtubeUrl} />}
      {post.spotifyUrl && <SpotifyEmbed url={post.spotifyUrl} />}

      {/* Body */}
      <MarkdownRenderer html={html} />
    </article>
  );
}

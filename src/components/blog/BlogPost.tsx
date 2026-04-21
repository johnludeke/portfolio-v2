import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { BlogPost as BlogPostType } from "@/lib/types";
import MarkdownRenderer from "./MarkdownRenderer";

interface BlogPostProps {
  post: BlogPostType;
  html: string;
}

export default function BlogPost({ post, html }: BlogPostProps) {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      {/* Header */}
      <header className="mb-10">
        <time className="text-xs font-mono text-zinc-400">
          {formatDate(post.publishDate || post.createdAt)}
        </time>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-cBlack leading-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-4 text-lg text-zinc-500 leading-relaxed">{post.excerpt}</p>
        )}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs font-mono border border-zinc-300 text-zinc-500 px-2 py-0.5"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Thumbnail */}
      {post.thumbnail && (
        <div className="relative w-full aspect-video mb-10 overflow-hidden bg-zinc-100">
          <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
        </div>
      )}

      {/* Body */}
      <MarkdownRenderer html={html} />
    </article>
  );
}

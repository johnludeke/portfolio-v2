import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block border border-zinc-200 bg-white hover:-translate-y-1 hover:shadow-card transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-zinc-100 overflow-hidden">
        {post.thumbnail ? (
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-zinc-200" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-2">
        <time className="block text-xs font-mono text-zinc-400">
          {formatDate(post.publishDate || post.createdAt)}
        </time>

        <h3 className="font-bold text-cBlack leading-snug group-hover:opacity-60 transition-opacity">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm text-zinc-500 line-clamp-2">{post.excerpt}</p>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs font-mono border border-zinc-300 text-zinc-500 px-1.5 py-0.5"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

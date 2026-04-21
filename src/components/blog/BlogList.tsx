"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { BlogPost, Tag } from "@/lib/types";
import BlogCard from "./BlogCard";

interface BlogListProps {
  posts: BlogPost[];
  tags: Tag[];
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={active ? "text-cBlack" : "text-zinc-400"}>
      <rect x="1" y="1" width="6" height="6" rx="0.5" fill="currentColor" />
      <rect x="9" y="1" width="6" height="6" rx="0.5" fill="currentColor" />
      <rect x="1" y="9" width="6" height="6" rx="0.5" fill="currentColor" />
      <rect x="9" y="9" width="6" height="6" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={active ? "text-cBlack" : "text-zinc-400"}>
      <rect x="1" y="2" width="14" height="2" rx="0.5" fill="currentColor" />
      <rect x="1" y="7" width="14" height="2" rx="0.5" fill="currentColor" />
      <rect x="1" y="12" width="14" height="2" rx="0.5" fill="currentColor" />
    </svg>
  );
}

export default function BlogList({ posts, tags }: BlogListProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return posts
      .filter((p) => {
        if (q && !p.title.toLowerCase().includes(q) && !p.excerpt.toLowerCase().includes(q)) return false;
        if (selectedTags.length > 0 && !selectedTags.some((s) => p.tags.some((t) => t.slug === s))) return false;
        return true;
      })
      .sort((a, b) => {
        const da = new Date(a.publishDate || a.createdAt).getTime();
        const db = new Date(b.publishDate || b.createdAt).getTime();
        return sort === "newest" ? db - da : da - db;
      });
  }, [posts, search, selectedTags, sort]);

  function toggleTag(slug: string) {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="w-full border-b border-zinc-200 focus:border-cBlack outline-none py-2 text-sm font-mono placeholder:text-zinc-400 bg-transparent transition-colors"
        />

        {/* Tags + Sort + View row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tag filters */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const active = selectedTags.includes(tag.slug);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.slug)}
                  className={`text-xs font-mono px-2.5 py-1 border transition-colors ${
                    active
                      ? "bg-cBlack text-white border-cBlack"
                      : "bg-white text-zinc-500 border-zinc-300 hover:border-cBlack hover:text-cBlack"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>

          {/* Sort + View toggle */}
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-3">
              <span>Sort:</span>
              {(["newest", "oldest"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`capitalize transition-colors ${
                    sort === s ? "text-cBlack font-semibold" : "hover:text-cBlack"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 border-l border-zinc-200 pl-4">
              <button
                onClick={() => setView("grid")}
                className="p-1 transition-colors hover:opacity-70"
                aria-label="Grid view"
              >
                <GridIcon active={view === "grid"} />
              </button>
              <button
                onClick={() => setView("list")}
                className="p-1 transition-colors hover:opacity-70"
                aria-label="List view"
              >
                <ListIcon active={view === "list"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-zinc-400">
          <p className="text-lg">No posts found.</p>
          {(search || selectedTags.length > 0) && (
            <button
              onClick={() => { setSearch(""); setSelectedTags([]); }}
              className="text-sm mt-2 underline hover:text-cBlack transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-100">
          {filtered.map((post) => (
            <BlogListRow key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function BlogListRow({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex items-center gap-4 py-4 hover:bg-zinc-50 transition-colors -mx-3 px-3"
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-16 h-16 bg-zinc-100 overflow-hidden">
        {post.thumbnail ? (
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-zinc-200" />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3">
          <h3 className="font-semibold text-cBlack text-sm leading-snug truncate group-hover:opacity-60 transition-opacity">
            {post.title}
          </h3>
          {post.tags.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1 shrink-0">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs font-mono border border-zinc-300 text-zinc-400 px-1.5 py-0.5"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        {post.excerpt && (
          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1 hidden sm:block">{post.excerpt}</p>
        )}
        <time className="block text-xs font-mono text-zinc-400 mt-0.5">
          {formatDate(post.publishDate || post.createdAt)}
        </time>
      </div>

      {/* Arrow */}
      <svg
        width="16" height="16" viewBox="0 0 16 16" fill="none"
        className="shrink-0 text-zinc-300 group-hover:text-cBlack group-hover:translate-x-0.5 transition-all"
      >
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

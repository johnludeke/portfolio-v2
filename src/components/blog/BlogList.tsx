"use client";

import { useState, useMemo } from "react";
import type { BlogPost, Tag } from "@/lib/types";
import BlogCard from "./BlogCard";

interface BlogListProps {
  posts: BlogPost[];
  tags: Tag[];
}

export default function BlogList({ posts, tags }: BlogListProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

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

        {/* Tags + Sort row */}
        {(tags.length > 0 || true) && (
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

            {/* Sort */}
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
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
          </div>
        )}
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

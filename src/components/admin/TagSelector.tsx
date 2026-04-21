"use client";

import { useState } from "react";
import type { Tag } from "@/lib/types";

interface TagSelectorProps {
  allTags: Tag[];
  selected: Tag[];
  onChange: (tags: Tag[]) => void;
}

export default function TagSelector({ allTags, selected, onChange }: TagSelectorProps) {
  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [localTags, setLocalTags] = useState<Tag[]>(allTags);

  const selectedIds = new Set(selected.map((t) => t.id));
  const query = input.trim().toLowerCase();
  const exactMatch = localTags.some((t) => t.name.toLowerCase() === query);
  const suggestions = query
    ? localTags.filter((t) => t.name.toLowerCase().includes(query) && !selectedIds.has(t.id))
    : localTags.filter((t) => !selectedIds.has(t.id));

  function toggleTag(tag: Tag) {
    if (selectedIds.has(tag.id)) {
      onChange(selected.filter((t) => t.id !== tag.id));
    } else {
      onChange([...selected, tag]);
      setInput("");
    }
  }

  async function createTag() {
    if (!input.trim() || exactMatch) return;
    setCreating(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const newTag: Tag = data.tag;
      setLocalTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
      onChange([...selected, newTag]);
      setInput("");
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-cBlack">Tags</label>

      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag)}
              className="flex items-center gap-1 text-xs font-mono bg-cBlack text-white px-2 py-1 hover:bg-zinc-700 transition-colors"
            >
              {tag.name}
              <span className="opacity-60 ml-0.5">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (suggestions[0] && !exactMatch) toggleTag(suggestions[0]);
              else if (!exactMatch) createTag();
            }
          }}
          placeholder="Search or create tag..."
          className="flex-1 border border-zinc-300 px-3 py-2 text-sm font-mono placeholder:text-zinc-400 focus:outline-none focus:border-cBlack transition-colors"
        />
        {input.trim() && !exactMatch && (
          <button
            type="button"
            onClick={createTag}
            disabled={creating}
            className="text-xs border border-zinc-300 px-3 py-2 hover:border-cBlack hover:text-cBlack transition-colors disabled:opacity-50 font-mono"
          >
            {creating ? "..." : `+ "${input.trim()}"`}
          </button>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag)}
              className="text-xs font-mono border border-zinc-300 text-zinc-500 px-2 py-0.5 hover:border-cBlack hover:text-cBlack transition-colors"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

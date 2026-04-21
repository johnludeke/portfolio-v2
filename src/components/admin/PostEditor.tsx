"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Toggle from "@/components/ui/Toggle";
import Button from "@/components/ui/Button";
import ImageUpload from "./ImageUpload";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import type { BlogPost } from "@/lib/types";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface PostEditorProps {
  post?: BlogPost; // undefined = create mode
}

export default function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(isEdit && post?.published);
  const [publishDate, setPublishDate] = useState(post?.publishDate ?? "");
  const [thumbnail, setThumbnail] = useState(post?.thumbnail ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(post?.youtubeUrl ?? "");
  const [spotifyUrl, setSpotifyUrl] = useState(post?.spotifyUrl ?? "");
  const [published, setPublished] = useState(post?.published ?? false);

  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");

  // Auto-generate slug from title (only if not locked and not in edit mode)
  useEffect(() => {
    if (!slugLocked && !isEdit && title) {
      setSlug(slugify(title));
    }
  }, [title, slugLocked, isEdit]);

  // Generate preview HTML when switching to preview tab
  useEffect(() => {
    if (tab === "preview" && content) {
      import("@/lib/markdown")
        .then(({ markdownToHtml }) => markdownToHtml(content))
        .then(setPreviewHtml);
    }
  }, [tab, content]);

  // Lock slug once published
  useEffect(() => {
    if (published && isEdit) setSlugLocked(true);
  }, [published, isEdit]);

  async function handleSave() {
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    if (!slug.trim()) { setError("Slug is required"); return; }

    setSaving(true);
    try {
      const body = {
        title,
        slug,
        publishDate,
        thumbnail,
        excerpt,
        content,
        youtubeUrl: youtubeUrl || undefined,
        spotifyUrl: spotifyUrl || undefined,
        published,
      };

      const url = isEdit ? `/api/posts/${post!.slug}` : "/api/posts";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
      />

      {/* Slug */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-cBlack">Slug</label>
        <div className="flex gap-2 items-center">
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            disabled={slugLocked}
            placeholder="post-url-slug"
            className="flex-1 border border-zinc-300 px-3 py-2 text-sm text-cBlack placeholder:text-zinc-400 focus:outline-none focus:border-cBlack transition-colors disabled:bg-zinc-50 disabled:text-zinc-400"
          />
          {slugLocked && (
            <button
              type="button"
              onClick={() => setSlugLocked(false)}
              className="text-xs text-zinc-400 hover:text-cBlack border border-zinc-200 px-2 py-1"
            >
              Unlock
            </button>
          )}
        </div>
        <p className="text-xs text-zinc-400 font-mono">/blog/{slug || "…"}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Publish date */}
        <Input
          label="Publish Date"
          type="date"
          value={publishDate}
          onChange={(e) => setPublishDate(e.target.value)}
        />

        {/* Published toggle */}
        <div className="flex flex-col gap-1 justify-end pb-0.5">
          <Toggle
            checked={published}
            onChange={setPublished}
            label={published ? "Published" : "Draft"}
          />
        </div>
      </div>

      {/* Thumbnail */}
      <ImageUpload value={thumbnail} onChange={setThumbnail} />

      {/* Excerpt */}
      <Textarea
        label="Excerpt"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Short preview text (shown on blog listing page)"
        className="min-h-[80px]"
      />

      {/* Optional media */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="YouTube URL (optional)"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
        />
        <Input
          label="Spotify URL (optional)"
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          placeholder="https://open.spotify.com/episode/..."
        />
      </div>

      {/* Markdown editor */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-cBlack">Content</span>

        {/* Write / Preview tabs */}
        <div className="flex border-b border-zinc-200 mb-0">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${
                tab === t
                  ? "border-cBlack text-cBlack"
                  : "border-transparent text-zinc-400 hover:text-cBlack"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "write" ? (
          <div data-color-mode="light">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val ?? "")}
              height={400}
              preview="edit"
              hideToolbar={false}
            />
          </div>
        ) : (
          <div className="min-h-[400px] border border-zinc-200 p-6 bg-white">
            {content ? (
              <MarkdownRenderer html={previewHtml} />
            ) : (
              <p className="text-zinc-400 text-sm italic">Nothing to preview.</p>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} loading={saving}>
          {isEdit ? "Save Changes" : "Create Post"}
        </Button>
        <Button variant="ghost" onClick={() => router.push("/admin")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import type { BlogPost } from "@/lib/types";

interface PostListProps {
  posts: BlogPost[];
}

export default function PostList({ posts: initialPosts }: PostListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(slug: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(slug);
    try {
      const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setPosts((p) => p.filter((post) => post.slug !== slug));
      router.refresh();
    } catch (err) {
      alert(String(err));
    } finally {
      setDeleting(null);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-400 border border-dashed border-zinc-200">
        <p className="text-sm">No posts yet.</p>
        <Link href="/admin/new" className="text-sm text-cBlue hover:underline mt-1 inline-block">
          Create your first post
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-zinc-200 bg-white divide-y divide-zinc-100">
      {posts.map((post) => (
        <div key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-medium text-sm text-cBlack truncate">{post.title}</span>
              <Badge published={post.published} />
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-400 font-mono">
              <span>{post.slug}</span>
              {post.publishDate && <span>· {formatDate(post.publishDate)}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/admin/edit/${post.slug}`}
              className="p-1.5 text-zinc-400 hover:text-cBlack transition-colors"
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </Link>
            <button
              onClick={() => handleDelete(post.slug)}
              disabled={deleting === post.slug}
              className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

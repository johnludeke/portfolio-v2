import Link from "next/link";
import { getAllTags } from "@/lib/posts";
import PostEditor from "@/components/admin/PostEditor";
import type { Tag } from "@/lib/types";

export default async function NewPostPage() {
  let allTags: Tag[] = [];
  try { allTags = await getAllTags(); } catch {}

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin" className="text-sm text-zinc-400 hover:text-cBlack transition-colors font-mono">
          ← Posts
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-cBlack">New Post</h1>
      </div>
      <PostEditor allTags={allTags} />
    </div>
  );
}

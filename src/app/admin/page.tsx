import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/admin/PostList";
import type { BlogPost } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await getAllPosts();
  } catch {
    // Supabase not configured yet
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cBlack">Blog Posts</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/new"
          className="inline-flex items-center gap-1.5 bg-cBlack text-white text-sm font-medium px-4 py-2 hover:-translate-y-0.5 hover:shadow-card transition-all duration-150"
        >
          <PlusIcon className="w-4 h-4" />
          New Post
        </Link>
      </div>

      <PostList posts={posts} />
    </div>
  );
}

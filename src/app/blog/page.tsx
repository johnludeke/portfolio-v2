import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";
import BlogList from "@/components/blog/BlogList";
import Navbar from "@/components/layout/Navbar";
import type { BlogPost } from "@/lib/types";

export const metadata = {
  title: "Blog — John Doe",
  description: "Thoughts on software engineering, projects, and more.",
};

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await getPublishedPosts();
  } catch {
    // Supabase not configured yet — show empty state
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10">
            <Link href="/" className="text-sm text-zinc-400 hover:text-cBlack transition-colors font-mono">
              ← Home
            </Link>
            <h1 className="mt-4 text-4xl font-bold text-cBlack">Blog</h1>
            <div className="mt-2 h-1 w-12 bg-cBlue" />
          </div>
          <BlogList posts={posts} />
        </div>
      </main>
    </>
  );
}

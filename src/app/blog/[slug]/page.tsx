import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { markdownToHtml } from "@/lib/markdown";
import BlogPostComponent from "@/components/blog/BlogPost";
import Navbar from "@/components/layout/Navbar";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts();
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (!post || !post.published) return {};
    return {
      title: `${post.title} — John Ludeke`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.thumbnail ? [post.thumbnail] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post = null;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  if (!post || !post.published) notFound();

  const html = await markdownToHtml(post.content || "");

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-white">
        <div className="mx-auto max-w-2xl px-6 pt-8">
          <Link href="/blog" className="text-sm text-zinc-400 hover:text-cBlack transition-colors font-mono">
            ← Blog
          </Link>
        </div>
        <BlogPostComponent post={post} html={html} />
      </main>
    </>
  );
}

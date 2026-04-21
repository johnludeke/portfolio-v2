import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug } from "@/lib/posts";
import PostEditor from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
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

  if (!post) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin" className="text-sm text-zinc-400 hover:text-cBlack transition-colors font-mono">
          ← Posts
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-cBlack">Edit Post</h1>
        <p className="text-sm text-zinc-400 font-mono mt-0.5">/blog/{post.slug}</p>
      </div>
      <PostEditor post={post} />
    </div>
  );
}

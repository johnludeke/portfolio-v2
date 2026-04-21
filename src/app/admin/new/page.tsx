import Link from "next/link";
import PostEditor from "@/components/admin/PostEditor";

export default function NewPostPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin" className="text-sm text-zinc-400 hover:text-cBlack transition-colors font-mono">
          ← Posts
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-cBlack">New Post</h1>
      </div>
      <PostEditor />
    </div>
  );
}

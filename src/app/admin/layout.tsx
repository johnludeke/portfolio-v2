import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Admin header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-zinc-400 hover:text-cBlack transition-colors font-mono">
              ← Site
            </a>
            <span className="text-zinc-200">|</span>
            <a href="/admin" className="text-sm font-semibold text-cBlack">
              Admin
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">{session.user?.email}</span>
            <a
              href="/api/auth/signout"
              className="text-xs text-zinc-500 hover:text-cBlack border border-zinc-200 px-2.5 py-1 transition-colors"
            >
              Sign out
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function GatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/trouble/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Wrong password" }));
        setError(error ?? "Wrong password");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-xs space-y-5 text-center">
        <div className="space-y-1">
          <h1 className="font-script text-4xl text-cBlack">trouble</h1>
          <p className="text-sm text-zinc-500">friends only. enter the password.</p>
        </div>
        <Input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          autoFocus
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Enter
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { PublicPlayer } from "@/lib/trouble";

interface AuthPanelProps {
  onAuth: (creds: { username: string; password: string }, player: PublicPlayer) => void;
}

export default function AuthPanel({ onAuth }: AuthPanelProps) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bracketName, setBracketName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/trouble/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, username, password, bracketName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      onAuth({ username: username.trim(), password }, data.player);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-4 flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("register")}
          className={mode === "register" ? "font-bold underline" : "text-zinc-400"}
        >
          New player
        </button>
        <span className="text-zinc-300">·</span>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={mode === "login" ? "font-bold underline" : "text-zinc-400"}
        >
          Returning
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Username"
          placeholder="your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
        />
        <Input
          label="Password"
          type="password"
          placeholder="set a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
        />
        {mode === "register" && (
          <Input
            label="Bracket name"
            placeholder="name your bracket (optional)"
            value={bracketName}
            onChange={(e) => setBracketName(e.target.value)}
          />
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          {mode === "register" ? "Create my bracket" : "Log in"}
        </Button>
      </form>
      <p className="mt-3 text-center text-[11px] text-zinc-400">
        Not secure — don&apos;t reuse a real password.
      </p>
    </div>
  );
}

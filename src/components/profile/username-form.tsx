"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UsernameForm({ username }: { username: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(username ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const unchanged = value.trim().toLowerCase() === (username ?? "");

  async function save() {
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      const res = await fetch("/api/profile/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save the username.");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the username.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="mb-3 text-[13px] text-muted-foreground">
        {username ? (
          <>
            Your username is <span className="text-foreground">@{username}</span>.
          </>
        ) : (
          "Pick a username. It must be unique."
        )}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="username" className="sr-only">
          Username
        </label>
        <div className="flex h-8 w-full max-w-xs items-center rounded-md border bg-background pl-2.5 text-[13px] focus-within:ring-2 focus-within:ring-ring">
          <span className="text-muted-foreground">@</span>
          <input
            id="username"
            autoComplete="off"
            spellCheck={false}
            maxLength={20}
            placeholder="username"
            value={value}
            onChange={(e) => {
              setSaved(false);
              setValue(e.target.value.toLowerCase());
            }}
            className="h-full w-full bg-transparent px-1 outline-none placeholder:text-muted-foreground"
          />
        </div>
        <Button variant="outline" onClick={save} disabled={busy || unchanged || value.trim() === ""}>
          {busy && <Loader2 className="animate-spin" />}
          Save
        </Button>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        3-20 characters. Lowercase letters, numbers and underscores, starting with a letter.
      </p>

      {saved && (
        <p role="status" className="mt-2 flex items-center gap-1.5 text-[13px] text-up">
          <Check className="size-4" /> Saved.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

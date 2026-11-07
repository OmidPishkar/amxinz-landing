"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyLinkButton } from "@/components/challenges/copy-link-button";

export function VisibilityForm({ isPublic, username }: { isPublic: boolean; username: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState<boolean | null>(null); // the value being saved
  const [error, setError] = useState<string | null>(null);

  async function choose(next: boolean) {
    if (next === isPublic || busy !== null) return;
    setError(null);
    setBusy(next);
    try {
      const res = await fetch("/api/profile/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public: next }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not save this setting.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this setting.");
    } finally {
      setBusy(null);
    }
  }

  const options = [
    { value: false, label: "Private" },
    { value: true, label: "Public" },
  ];

  return (
    <div>
      <p className="mb-3 text-[13px] text-muted-foreground">
        {isPublic
          ? "Anyone can see your page, without logging in. Logged-in players can rate you from 1 to 5 stars."
          : "Only you can see your page. Anyone who opens its address sees a message that it is private."}
      </p>

      <div role="group" aria-label="Profile visibility" className="inline-flex gap-1">
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={isPublic === o.value}
            disabled={busy !== null || (o.value && !username)}
            onClick={() => choose(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-[13px] hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50",
              isPublic === o.value ? "bg-accent font-medium" : "text-muted-foreground",
            )}
          >
            {busy === o.value && <Loader2 className="size-3.5 animate-spin" />}
            {o.label}
          </button>
        ))}
      </div>

      {!username && (
        <p className="mt-2 text-xs text-muted-foreground">Pick a username above first: it becomes your public address.</p>
      )}

      {username && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <a
            href={`/u/${username}`}
            className="text-[13px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            /u/{username}
          </a>
          {isPublic && <CopyLinkButton path={`/u/${username}`} />}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

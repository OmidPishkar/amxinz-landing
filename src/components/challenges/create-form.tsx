"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHALLENGE_DAYS, CHALLENGE_SIZE } from "@/lib/game";
import { cn } from "@/lib/utils";

export function CreateChallengeForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [days, setDays] = useState<number>(3);
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, days, isPublic }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not create the challenge.");
      router.push(`/challenges/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the challenge.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex max-w-md flex-col gap-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-[13px] font-medium">
          Title <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          placeholder="Friday chart battle"
          className="h-8 w-full rounded-md border bg-background px-2.5 text-[13px] outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <fieldset>
        <legend className="mb-1.5 text-[13px] font-medium">Open for</legend>
        <div className="flex gap-1">
          {CHALLENGE_DAYS.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={days === d}
              onClick={() => setDays(d)}
              className={cn(
                "rounded-md border px-3 py-1 text-[13px] hover:bg-accent",
                days === d ? "bg-accent font-medium" : "text-muted-foreground",
              )}
            >
              {d} {d === 1 ? "day" : "days"}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-2 text-[13px]">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="mt-0.5" />
        <span>
          List it on the Challenges page
          <span className="block text-muted-foreground">
            Turn this off to share it only by link with the people you choose.
          </span>
        </span>
      </label>

      <p className="text-[13px] text-muted-foreground">
        Everyone plays the same {CHALLENGE_SIZE} real charts, in their own time. You can play yours as soon as it is
        created.
      </p>

      <div>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          {busy ? `Picking ${CHALLENGE_SIZE} real charts…` : "Create challenge"}
        </Button>
        {error && (
          <p role="alert" className="mt-2 text-[13px] text-destructive">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginDialog } from "@/components/login-dialog";

export function RatingStars({
  username,
  average,
  count,
  mine,
  canRate,
  loggedIn,
}: {
  username: string;
  average: number;
  count: number;
  mine: number;
  canRate: boolean; // logged in and not the owner
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function rate(stars: number) {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, stars }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not save your rating.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your rating.");
    } finally {
      setBusy(false);
    }
  }

  // Interactive stars show your own rating (or the hovered one); read-only stars show the average.
  const shown = canRate ? hover || mine : Math.round(average);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => {
            const star = <Star className={cn("size-5", n <= shown ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />;
            return canRate ? (
              <button
                key={n}
                type="button"
                disabled={busy}
                aria-label={`Rate ${n} ${n === 1 ? "star" : "stars"}`}
                aria-pressed={mine === n}
                onMouseEnter={() => setHover(n)}
                onFocus={() => setHover(n)}
                onBlur={() => setHover(0)}
                onClick={() => rate(n)}
                className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {star}
              </button>
            ) : (
              <span key={n} className="p-0.5">
                {star}
              </span>
            );
          })}
        </div>
        <p className="text-[13px] text-muted-foreground">
          {count > 0 ? (
            <>
              <span className="font-medium text-foreground">{average.toFixed(1)}</span> · {count}{" "}
              {count === 1 ? "rating" : "ratings"}
            </>
          ) : (
            "No ratings yet"
          )}
        </p>
      </div>

      {canRate && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {mine > 0 ? (
            <>
              You rated {mine} {mine === 1 ? "star" : "stars"}.{" "}
              <button type="button" onClick={() => rate(0)} disabled={busy} className="underline underline-offset-4 hover:text-foreground">
                Remove
              </button>
            </>
          ) : (
            "Click a star to rate this player."
          )}
        </p>
      )}
      {!loggedIn && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          <LoginDialog>
            <button type="button" className="underline underline-offset-4 hover:text-foreground">
              Log in
            </button>
          </LoginDialog>{" "}
          to rate this player.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

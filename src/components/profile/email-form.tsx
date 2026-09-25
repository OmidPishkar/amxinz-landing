"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmailForm({
  email,
  verified,
  suggested,
}: {
  email: string | null;
  verified: boolean;
  suggested: string;
}) {
  const [value, setValue] = useState(email ?? suggested);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unchanged = verified && value.trim().toLowerCase() === (email ?? "");

  async function send() {
    setError(null);
    setSentTo(null);
    setBusy(true);
    try {
      const res = await fetch("/api/profile/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send the email.");
      setSentTo(value.trim().toLowerCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-[13px] text-muted-foreground">
        {email && verified ? (
          <>
            <Check className="size-4 text-up" />
            <span>
              <span className="text-foreground">{email}</span> is confirmed.
            </span>
          </>
        ) : (
          <span>No confirmed email yet. Add one to be reachable about your account.</span>
        )}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 w-full max-w-sm rounded-md border bg-background px-2.5 text-[13px] outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button variant="outline" onClick={send} disabled={busy || unchanged || value.trim() === ""}>
          {busy && <Loader2 className="animate-spin" />}
          {email && verified ? "Change email" : "Send confirmation link"}
        </Button>
      </div>

      {sentTo && (
        <p role="status" className="mt-2 text-[13px] text-muted-foreground">
          We sent a link to <span className="text-foreground">{sentTo}</span>. It expires in 1 hour. Your email is
          saved once you open it.
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

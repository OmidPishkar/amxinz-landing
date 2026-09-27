"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminPostControls({ id, slug }: { id: string; slug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/weblog/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Could not delete the post.");
      }
      router.push("/weblog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the post.");
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-3 text-[13px]">
      <span className="text-muted-foreground">Admin:</span>
      <Button asChild variant="outline" size="sm">
        <Link href={`/weblog/${slug}/edit`}>
          <Pencil /> Edit
        </Link>
      </Button>
      {confirming ? (
        <>
          <span className="text-muted-foreground">Delete this post permanently?</span>
          <Button variant="outline" size="sm" onClick={remove} disabled={busy} className="text-destructive">
            {busy ? <Loader2 className="animate-spin" /> : <Trash2 />}
            Confirm delete
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={busy}>
            Cancel
          </Button>
        </>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
          <Trash2 /> Delete
        </Button>
      )}
      {error && <span className="text-destructive">{error}</span>}
    </div>
  );
}

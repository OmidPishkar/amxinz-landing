"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { useUploadThing } from "@/lib/uploadthing";

const MAX_BYTES = 2 * 1024 * 1024;

export function AvatarUploader({
  name,
  image,
  hasCustom,
}: {
  name: string;
  image: string | null;
  hasCustom: boolean;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { startUpload } = useUploadThing("avatar", {
    onUploadError: (err) => setError(err.message),
  });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be chosen again
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    if (file.size > MAX_BYTES) return setError("The image must be 2 MB or smaller.");

    setError(null);
    setBusy("upload");
    try {
      const uploaded = await startUpload([file]);
      const first = uploaded?.[0] as { ufsUrl?: string; url?: string } | undefined;
      const url = first?.ufsUrl ?? first?.url;
      if (!url) throw new Error("Upload failed. Try again.");

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save the photo.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setError(null);
    setBusy("remove");
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      if (!res.ok) throw new Error("Could not remove the photo.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove the photo.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <Avatar name={name} image={image} size={56} />
        <div className="flex flex-wrap gap-2">
          <input ref={input} type="file" accept="image/*" className="sr-only" onChange={onFile} tabIndex={-1} />
          <Button variant="outline" onClick={() => input.current?.click()} disabled={busy !== null}>
            {busy === "upload" && <Loader2 className="animate-spin" />}
            {busy === "upload" ? "Uploading…" : "Upload photo"}
          </Button>
          {hasCustom && (
            <Button variant="ghost" onClick={remove} disabled={busy !== null}>
              {busy === "remove" && <Loader2 className="animate-spin" />}
              Remove
            </Button>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">PNG, JPG or WebP, up to 2 MB.</p>
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

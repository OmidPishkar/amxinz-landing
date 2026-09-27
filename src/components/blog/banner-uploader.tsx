"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageOff, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/lib/uploadthing";

const MAX_BYTES = 4 * 1024 * 1024;

export function BannerUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);

  const { startUpload } = useUploadThing("blogBanner", {
    onUploadError: (err) => setError(err.message),
  });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    if (file.size > MAX_BYTES) return setError("The image must be 4 MB or smaller.");

    setError(null);
    setBusy(true);
    try {
      const uploaded = await startUpload([file]);
      const first = uploaded?.[0] as { ufsUrl?: string; url?: string } | undefined;
      const url = first?.ufsUrl ?? first?.url;
      if (!url) throw new Error("Upload failed. Try again.");
      setBroken(false);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="relative flex aspect-[16/6] w-full items-center justify-center overflow-hidden rounded-lg border bg-muted">
        {value && !broken ? (
          <Image src={value} alt="" fill unoptimized className="object-cover" onError={() => setBroken(true)} />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageOff className="size-6" />
            <span className="text-xs">No banner yet</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input ref={input} type="file" accept="image/*" className="sr-only" onChange={onFile} tabIndex={-1} />
        <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Upload />}
          {value ? "Replace banner" : "Upload banner"}
        </Button>
        <span className="text-xs text-muted-foreground">16:6, up to 4 MB.</span>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

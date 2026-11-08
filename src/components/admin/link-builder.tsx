"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Target {
  label: string;
  path: string;
}

const QUICK_REFS = ["yt", "ig", "tg", "x"];

// Builds a link with ?ref=<name> so the panel can show which post or video brought people in.
export function LinkBuilder({
  siteUrl,
  challenges,
  posts,
}: {
  siteUrl: string;
  challenges: Target[];
  posts: Target[];
}) {
  const [path, setPath] = useState("/");
  const [ref, setRef] = useState("yt");
  const [copied, setCopied] = useState(false);

  const cleanRef = ref.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32);
  const url = `${siteUrl}${path}${cleanRef ? `?ref=${cleanRef}` : ""}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  const field =
    "h-8 w-full rounded-md border bg-background px-2.5 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="rounded-lg border p-4">
      <p className="text-[13px] font-medium">Campaign link builder</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Add a name to a link before you post it (for example a YouTube description). Visitors and signups from it then
        appear in the table above under that name.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-muted-foreground">
          Page
          <select value={path} onChange={(e) => setPath(e.target.value)} className={`${field} mt-1`}>
            <option value="/">Home (play)</option>
            <option value="/challenges">Challenges list</option>
            {challenges.length > 0 && (
              <optgroup label="Challenges">
                {challenges.map((c) => (
                  <option key={c.path} value={c.path}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
            )}
            {posts.length > 0 && (
              <optgroup label="Blog posts">
                {posts.map((p) => (
                  <option key={p.path} value={p.path}>
                    {p.label}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>

        <div className="text-xs text-muted-foreground">
          <label htmlFor="ref-name">Source name</label>
          <input id="ref-name" value={ref} onChange={(e) => setRef(e.target.value)} className={`${field} mt-1`} placeholder="yt" />
          <div className="mt-1.5 flex gap-1">
            {QUICK_REFS.map((r) => (
              <button key={r} type="button" onClick={() => setRef(r)} className="rounded-md border px-2 py-0.5 hover:bg-accent">
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-2.5 py-1.5 text-[12px]">{url}</code>
        <Button variant="outline" onClick={copy}>
          {copied ? <Check /> : <Link2 />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

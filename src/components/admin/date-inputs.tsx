"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Custom From/To for the admin panel. Keeps the tab and selected post; picking a date switches the range to "custom".
export function AdminDateInputs({ from, to, max }: { from: string; to: string; max: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: "from" | "to", value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("range", "custom");
    next.set("from", key === "from" ? value : (next.get("from") ?? from));
    next.set("to", key === "to" ? value : (next.get("to") ?? to));
    router.push(`${pathname}?${next.toString()}`);
  }

  const input =
    "h-7 rounded-md border bg-background px-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
      <label className="flex items-center gap-1.5">
        From
        <input type="date" value={from} max={to} onChange={(e) => e.target.value && update("from", e.target.value)} className={input} />
      </label>
      <label className="flex items-center gap-1.5">
        To
        <input type="date" value={to} min={from} max={max} onChange={(e) => e.target.value && update("to", e.target.value)} className={input} />
      </label>
    </div>
  );
}

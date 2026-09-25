"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Two native date inputs, clamped to the account's lifetime (min = signup date, max = today).
// Changing either one navigates the page with updated ?from=&to= (page resets to 1).
export function DateRangeFilter({
  minDate,
  maxDate,
  from,
  to,
}: {
  minDate: string;
  maxDate: string;
  from: string;
  to: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: "from" | "to", value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}#predictions`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
      <label className="flex items-center gap-1.5">
        From
        <input
          type="date"
          value={from}
          min={minDate}
          max={to || maxDate}
          onChange={(e) => update("from", e.target.value)}
          className="h-7 rounded-md border bg-background px-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <label className="flex items-center gap-1.5">
        To
        <input
          type="date"
          value={to}
          min={from || minDate}
          max={maxDate}
          onChange={(e) => update("to", e.target.value)}
          className="h-7 rounded-md border bg-background px-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
    </div>
  );
}

import { cn } from "@/lib/utils";

// Last results as small squares, oldest to newest. Green = correct, red = wrong.
export function FormDots({ results }: { results: boolean[] }) {
  if (results.length === 0) return null;
  const wins = results.filter(Boolean).length;
  return (
    <div
      role="img"
      aria-label={`Last ${results.length} predictions: ${wins} correct, ${results.length - wins} wrong`}
      className="flex gap-1"
    >
      {results.map((ok, i) => (
        <span key={i} className={cn("size-3 rounded-[3px]", ok ? "bg-up" : "bg-down")} />
      ))}
    </div>
  );
}

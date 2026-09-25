export interface BarItem {
  label: string;
  winRate: number; // -1 = no data
  played: number;
}

// Horizontal win-rate bars, used for both "up vs down" and "by asset".
export function BarList({ title, items, emptyText }: { title: string; items: BarItem[]; emptyText: string }) {
  const withData = items.filter((i) => i.played > 0);

  return (
    <div className="rounded-lg border p-5">
      <p className="mb-4 text-sm font-medium">{title}</p>
      {withData.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {withData.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex items-baseline justify-between text-[13px]">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">
                  {item.winRate}% <span className="text-xs">({item.played})</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${item.label}: ${item.winRate}% over ${item.played} predictions`}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, item.winRate)}%`,
                    background: item.winRate >= 50 ? "var(--up)" : "var(--down)",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

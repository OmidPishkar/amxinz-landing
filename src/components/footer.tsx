import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Amxinz. Market data from Binance. For practice, not financial advice.</p>
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <Link href="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
        </nav>
      </div>
    </footer>
  );
}

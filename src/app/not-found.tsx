import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

// A real 404 (status code is set by Next) that search engines won't index.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-24">
      <p className="text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">This page does not exist</h1>
      <p className="mt-2 text-muted-foreground">Check the address, or head back to the Home.</p>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/leaderboard">Leaderboard</Link>
        </Button>
      </div>
    </div>
  );
}

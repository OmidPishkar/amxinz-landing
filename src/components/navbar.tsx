import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginDialog } from "@/components/login-dialog";
import { UserMenu } from "@/components/user-menu";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">Amxinz</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/leaderboard">Leaderboard</Link>
          </Button>
          <ThemeToggle />
          {session?.user ? (
            <UserMenu name={session.user.name ?? "Player"} image={session.user.image ?? null} />
          ) : (
            <LoginDialog>
              <Button size="sm" className="ml-1">Login</Button>
            </LoginDialog>
          )}
        </nav>
      </div>
    </header>
  );
}

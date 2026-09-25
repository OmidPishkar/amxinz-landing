import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginDialog } from "@/components/login-dialog";
import { UserMenu } from "@/components/user-menu";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  // Uploaded profile photo, if any. A database hiccup must never break the whole header.
  let avatar: string | null = null;
  if (session?.user?.id) {
    try {
      avatar = (await getUserById(session.user.id))?.avatarUrl ?? null;
    } catch {
      avatar = null;
    }
  }

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
            <UserMenu name={session.user.name ?? "Player"} image={avatar ?? session.user.image ?? null} />
          ) : (
            <LoginDialog>
              <Button size="sm" className="ml-1">Log in</Button>
            </LoginDialog>
          )}
        </nav>
      </div>
    </header>
  );
}

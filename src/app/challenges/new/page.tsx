import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateChallengeForm } from "@/components/challenges/create-form";
import { LoginDialog } from "@/components/login-dialog";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create a challenge",
  robots: { index: false, follow: false },
};

export default async function NewChallengePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
        <Link href="/challenges" className="hover:text-foreground hover:underline">
          Challenges
        </Link>{" "}
        / New
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight">Create a challenge</h1>

      <div className="mt-6">
        {session?.user ? (
          <CreateChallengeForm />
        ) : (
          <div className="rounded-lg border p-8 text-center">
            <p className="font-medium">Log in to create a challenge.</p>
            <div className="mt-4">
              <LoginDialog>
                <Button>Log in</Button>
              </LoginDialog>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

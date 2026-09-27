import type { Session } from "next-auth";
import { getUserById } from "./users";

// Comma-separated in .env, e.g. ADMIN_EMAILS=omidjr17@gmail.com
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export function isAdminEmail(email: string | null | undefined) {
  return !!email && ADMIN_EMAILS.has(email.toLowerCase());
}

/**
 * True if the signed-in session belongs to an admin: the account must have a
 * *confirmed* email (via the profile page's "Confirm email" flow) matching
 * ADMIN_EMAILS. Every route that creates/edits/deletes a post must call this
 * itself — a hidden "New post" button in the UI is not access control.
 */
export async function isAdminSession(session: Session | null): Promise<boolean> {
  if (!session?.user?.id) return false;
  const user = await getUserById(session.user.id);
  return !!user?.emailVerified && isAdminEmail(user.email);
}

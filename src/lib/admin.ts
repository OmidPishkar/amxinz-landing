import type { Session } from "next-auth";
import { getUserById } from "./users";
import type { UserDoc } from "./types";

function listFromEnv(value: string | undefined, strip = ""): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((v) => v.trim().toLowerCase().replace(strip, ""))
      .filter(Boolean),
  );
}

// Comma-separated lists in .env:
//   ADMIN_EMAILS=omidjr17@gmail.com      (the account must have CONFIRMED this email on /profile)
//   ADMIN_USERNAMES=creator              (an account that holds this username)
const ADMIN_EMAILS = listFromEnv(process.env.ADMIN_EMAILS);
const ADMIN_USERNAMES = listFromEnv(process.env.ADMIN_USERNAMES, "@");

export function isAdminEmail(email: string | null | undefined) {
  return !!email && ADMIN_EMAILS.has(email.toLowerCase());
}

export function isAdminUsername(username: string | null | undefined) {
  return !!username && ADMIN_USERNAMES.has(username.toLowerCase());
}

/** The account has confirmed one of the admin emails. */
export function hasAdminEmail(user: Pick<UserDoc, "email" | "emailVerified"> | null | undefined) {
  return !!user?.emailVerified && isAdminEmail(user.email);
}

/**
 * True if the signed-in session belongs to an admin: a confirmed admin email, or a
 * username listed in ADMIN_USERNAMES. Every route that creates/edits/deletes a post, and
 * the admin panel itself, must call this on the server; a hidden button is not access control.
 *
 * An admin username can only ever be taken by an account with a confirmed admin email
 * (see the username route), so nobody can become admin by registering that name.
 */
export async function isAdminSession(session: Session | null): Promise<boolean> {
  if (!session?.user?.id) return false;
  const user = await getUserById(session.user.id);
  if (!user) return false;
  return hasAdminEmail(user) || isAdminUsername(user.username);
}

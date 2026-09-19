import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { isAddress, verifyMessage } from "ethers";
import { getDb } from "./mongodb";
import { buildSignMessage, shortAddress } from "./wallet";
import type { NonceDoc, UserDoc } from "./types";

async function upsertUser(
  provider: UserDoc["provider"],
  providerId: string,
  name: string,
  image: string | null,
) {
  const db = await getDb();
  const user = await db.collection<UserDoc>("users").findOneAndUpdate(
    { provider, providerId },
    {
      $setOnInsert: { score: 0, played: 0, correct: 0, createdAt: new Date() },
      $set: { name, image },
    },
    { upsert: true, returnDocument: "after" },
  );
  if (!user) throw new Error("Could not create user");
  return user;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        address: { type: "text" },
        signature: { type: "text" },
      },
      async authorize(credentials) {
        const address = credentials?.address?.toLowerCase();
        const signature = credentials?.signature;
        if (!address || !signature || !isAddress(address)) return null;

        // The nonce is single-use: it is deleted the moment it is fetched.
        const db = await getDb();
        const stored = await db
          .collection<NonceDoc>("nonces")
          .findOneAndDelete({ address });
        if (!stored || stored.expiresAt < new Date()) return null;

        let recovered: string;
        try {
          recovered = verifyMessage(buildSignMessage(address, stored.nonce), signature);
        } catch {
          return null;
        }
        if (recovered.toLowerCase() !== address) return null;

        const user = await upsertUser("wallet", address, shortAddress(address), null);
        return { id: user._id.toString(), name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Runs with `account` only on sign-in; afterwards the uid lives in the token.
      if (account && user) {
        if (account.provider === "google") {
          const doc = await upsertUser(
            "google",
            account.providerAccountId,
            user.name ?? "Player",
            user.image ?? null,
          );
          token.uid = doc._id.toString();
        } else {
          token.uid = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) session.user.id = token.uid;
      return session;
    },
  },
};

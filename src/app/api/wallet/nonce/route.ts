import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAddress } from "ethers";
import { getDb } from "@/lib/mongodb";
import { buildSignMessage } from "@/lib/wallet";
import type { NonceDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const address = typeof body?.address === "string" ? body.address.toLowerCase() : "";
  if (!isAddress(address)) {
    return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
  }

  const nonce = randomUUID().replace(/-/g, "");
  const db = await getDb();
  await db.collection<NonceDoc>("nonces").updateOne(
    { address },
    { $set: { nonce, expiresAt: new Date(Date.now() + 5 * 60_000) } },
    { upsert: true },
  );

  return NextResponse.json({ message: buildSignMessage(address, nonce) });
}

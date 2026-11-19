import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { UserDoc } from "@/lib/types";

export type PlanId = "free" | "essential" | "pro" | "elite";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "expired";
export type TermId = "7d" | "1m" | "3m" | "6m" | "1y";

export const PLAN_CATALOG = {
  free: { name: "Free", description: "Ad-supported access to core practice and basic progress tracking." },
  essential: { name: "Essential", description: "Regular practice, basic skill overview and full basic history.", prices: { "7d": 1.99, "1m": 4.99, "3m": 13.49, "6m": 24.99, "1y": 44.99 } },
  pro: { name: "Pro", description: "Full Skill Assessment, adaptive Personal Missions and Weekly Reports.", prices: { "7d": 3.99, "1m": 9.99, "3m": 26.99, "6m": 49.99, "1y": 89.99 } },
  elite: { name: "Elite", description: "Advanced analytics, detailed reports and extended risk analysis.", prices: { "7d": 7.99, "1m": 19.99, "3m": 53.99, "6m": 99.99, "1y": 179.99 } },
} as const;
export const TERM_DAYS: Record<TermId, number> = { "7d": 7, "1m": 30, "3m": 90, "6m": 180, "1y": 365 };

export interface SubscriptionPeriod {
  planId: Exclude<PlanId, "free">;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  startAt?: Date;
  endAt?: Date;
  createdAt: Date;
  trial?: boolean;
  cancelAtPeriodEnd?: boolean;
  invoiceId?: string;
  paymentId?: string;
}
export interface SubscriptionDoc {
  userId: string;
  planId: Exclude<PlanId, "free">;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  trial?: boolean;
  periods?: SubscriptionPeriod[];
  cancelAtPeriodEnd?: boolean;
}
export interface Entitlement {
  planId: PlanId;
  status: "free" | "trialing" | "active" | "expired";
  isAdFree: boolean;
  isTrial: boolean;
  currentPeriodEnd: Date | null;
  daysRemaining: number;
}
const FREE: Entitlement = { planId: "free", status: "free", isAdFree: false, isTrial: false, currentPeriodEnd: null, daysRemaining: 0 };

export async function getEntitlement(userId: string | null | undefined): Promise<Entitlement> {
  if (!userId) return FREE;
  try {
    const db = await getDb();
    const sub = await db.collection<SubscriptionDoc>("subscriptions").findOne({ userId });
    if (!sub) return FREE;
    const now = Date.now();
    if (sub.periods?.length) {
      const current = sub.periods
        .filter((p) => (p.status === "active" || p.status === "trialing" || p.status === "cancelled") && new Date(p.currentPeriodStart).getTime() <= now && new Date(p.currentPeriodEnd).getTime() > now)
        .sort((a, b) => new Date(b.currentPeriodStart).getTime() - new Date(a.currentPeriodStart).getTime())[0];
      if (!current) return { ...FREE, status: "expired" };
      const end = new Date(current.currentPeriodEnd);
      return { planId: current.planId, status: current.status === "trialing" || current.trial ? "trialing" : "active", isAdFree: true, isTrial: current.status === "trialing" || current.trial === true, currentPeriodEnd: end, daysRemaining: Math.max(0, Math.ceil((end.getTime() - now) / 86400000)) };
    }
    const end = new Date(sub.currentPeriodEnd);
    if (!["active", "trialing", "cancelled"].includes(sub.status) || !Number.isFinite(end.getTime()) || end.getTime() <= now) return { ...FREE, status: "expired" };
    return { planId: sub.planId, status: sub.status === "trialing" || sub.trial ? "trialing" : "active", isAdFree: true, isTrial: sub.status === "trialing" || sub.trial === true, currentPeriodEnd: end, daysRemaining: Math.max(0, Math.ceil((end.getTime() - now) / 86400000)) };
  } catch (error) {
    console.error("getEntitlement:", error);
    return FREE;
  }
}

export async function startFreeTrial(userId: string) {
  if (!ObjectId.isValid(userId)) return { ok: false as const, reason: "email" as const };
  const db = await getDb();
  const user = await db.collection<UserDoc>("users").findOne({ _id: new ObjectId(userId) });
  if (!user || user.emailVerified !== true) return { ok: false as const, reason: "email" as const };
  const now = new Date();
  if ((await getEntitlement(userId)).isAdFree) return { ok: false as const, reason: "active" as const };
  const claims = db.collection("trial_claims");
  await claims.createIndex({ userId: 1 }, { unique: true });
  try {
    await claims.insertOne({ userId, claimedAt: now, expiresAt: new Date(now.getTime() + 3650 * 86400000) });
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) return { ok: false as const, reason: "used" as const };
    throw error;
  }
  const end = new Date(now.getTime() + 14 * 86400000);
  const period: SubscriptionPeriod = { planId: "elite", status: "trialing", currentPeriodStart: now, currentPeriodEnd: end, startAt: now, endAt: end, createdAt: now, trial: true, invoiceId: "free-trial" };
  try {
    const subscriptions = db.collection<SubscriptionDoc>("subscriptions");
    await subscriptions.createIndex({ userId: 1 }, { unique: true });
    await subscriptions.updateOne(
      { userId, "periods.invoiceId": { $ne: "free-trial" } },
      { $set: { planId: "elite", status: "trialing", currentPeriodStart: now, currentPeriodEnd: end, createdAt: now, trial: true, cancelAtPeriodEnd: false }, $push: { periods: period } },
      { upsert: true },
    );
    await db.collection<UserDoc>("users").updateOne({ _id: user._id }, { $set: { trialStartedAt: now } });
    return { ok: true as const, currentPeriodEnd: end };
  } catch (error) {
    await claims.deleteOne({ userId, claimedAt: now });
    throw error;
  }
}

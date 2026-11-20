import { randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { withUserSubscriptionLock, type SubscriptionDoc, type SubscriptionPeriod } from "@/lib/subscriptions";

interface ReferralCodeDoc { userId: string; code: string; createdAt: Date }
interface ReferralDoc {
  referredUserId: string;
  inviterId: string;
  code: string;
  createdAt: Date;
  missionCompletedAt?: Date;
  firstPaidAt?: Date;
  rewardedAt?: Date;
}

export async function ensureReferralCode(userId: string) {
  const db = await getDb();
  const col = db.collection<ReferralCodeDoc>("referral_codes");
  await Promise.all([col.createIndex({ userId: 1 }, { unique: true }), col.createIndex({ code: 1 }, { unique: true })]);
  const existing = await col.findOne({ userId });
  if (existing) return existing.code;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = randomBytes(5).toString("hex");
    try { await col.insertOne({ userId, code, createdAt: new Date() }); return code; }
    catch (error) {
      if ((error as { code?: number })?.code !== 11000) throw error;
      const sameUser = await col.findOne({ userId });
      if (sameUser) return sameUser.code;
    }
  }
  throw new Error("Could not create a referral code.");
}

export async function attributeReferral(referredUserId: string, rawCode: unknown) {
  if (typeof rawCode !== "string") return false;
  const code = rawCode.trim().toLowerCase();
  if (!/^[a-f0-9]{10}$/.test(code)) return false;
  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: new ObjectId(referredUserId) });
  if (!user || Date.now() - new Date(user.createdAt).getTime() > 24 * 60 * 60 * 1000) return false;
  const codeDoc = await db.collection<ReferralCodeDoc>("referral_codes").findOne({ code });
  if (!codeDoc || codeDoc.userId === referredUserId) return false;
  const referrals = db.collection<ReferralDoc>("referrals");
  await referrals.createIndex({ referredUserId: 1 }, { unique: true });
  try {
    await referrals.insertOne({ referredUserId, inviterId: codeDoc.userId, code, createdAt: new Date() });
    return true;
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) return false;
    throw error;
  }
}

async function grantProCreditUnlocked(inviterId: string, referredUserId: string) {
  const db = await getDb();
  const col = db.collection<SubscriptionDoc>("subscriptions");
  await col.createIndex({ userId: 1 }, { unique: true });
  const now = new Date();
  const rewardId = "referral:" + referredUserId;
  const existing = await col.findOne({ userId: inviterId });
  if (existing?.periods?.some((p) => p.invoiceId === rewardId)) return;
  let periods = existing?.periods ?? [];
  if (existing && !periods.length && ["active", "trialing", "cancelled"].includes(existing.status) && new Date(existing.currentPeriodEnd).getTime() > now.getTime()) {
    const legacy: SubscriptionPeriod = { planId: existing.planId, status: existing.status, currentPeriodStart: existing.currentPeriodStart, currentPeriodEnd: existing.currentPeriodEnd, startAt: existing.currentPeriodStart, endAt: existing.currentPeriodEnd, createdAt: existing.createdAt, trial: existing.trial };
    await col.updateOne({ userId: inviterId, $or: [{ periods: { $exists: false } }, { periods: { $size: 0 } }] }, { $set: { periods: [legacy] } });
    periods = [legacy];
  }
  const currentEnd = periods.filter((p) => ["active", "trialing", "cancelled"].includes(p.status) && new Date(p.currentPeriodEnd).getTime() > now.getTime()).reduce((max, p) => Math.max(max, new Date(p.currentPeriodEnd).getTime()), now.getTime());
  const start = new Date(currentEnd);
  const end = new Date(start.getTime() + 7 * 86400000);
  const period: SubscriptionPeriod = { planId: "pro", status: "active", currentPeriodStart: start, currentPeriodEnd: end, startAt: start, endAt: end, createdAt: now, invoiceId: rewardId, trial: false };
  const filter = { userId: inviterId, "periods.invoiceId": { $ne: rewardId } };
  try {
    await col.updateOne(filter, { $set: { planId: "pro", status: "active", currentPeriodStart: start, currentPeriodEnd: end, trial: false }, $push: { periods: period }, $setOnInsert: { createdAt: now } }, { upsert: true });
  } catch (error) {
    if ((error as { code?: number })?.code !== 11000) throw error;
    await col.updateOne(filter, { $set: { planId: "pro", status: "active", currentPeriodStart: start, currentPeriodEnd: end, trial: false }, $push: { periods: period } });
  }
}

async function grantProCredit(inviterId: string, referredUserId: string) {
  return withUserSubscriptionLock(inviterId, () => grantProCreditUnlocked(inviterId, referredUserId));
}

async function tryReward(referral: ReferralDoc) {
  if (!referral.missionCompletedAt || !referral.firstPaidAt || referral.rewardedAt) return false;
  await grantProCredit(referral.inviterId, referral.referredUserId);
  const db = await getDb();
  const now = new Date();
  const updated = await db.collection<ReferralDoc>("referrals").updateOne(
    { referredUserId: referral.referredUserId, rewardedAt: { $exists: false } },
    { $set: { rewardedAt: now } },
  );
  if (updated.modifiedCount) {
    await db.collection("referral_rewards").updateOne(
      { referredUserId: referral.referredUserId },
      { $setOnInsert: { referredUserId: referral.referredUserId, inviterId: referral.inviterId, rewardedAt: now, creditDays: 7, planId: "pro" } },
      { upsert: true },
    );
    return true;
  }
  return false;
}

export async function markReferralMissionComplete(userId: string) {
  const db = await getDb();
  const col = db.collection<ReferralDoc>("referrals");
  await col.updateOne({ referredUserId: userId, missionCompletedAt: { $exists: false } }, { $set: { missionCompletedAt: new Date() } });
  const referral = await col.findOne({ referredUserId: userId });
  if (referral) await tryReward(referral);
}

export async function markReferralPaid(userId: string) {
  const db = await getDb();
  const col = db.collection<ReferralDoc>("referrals");
  await col.updateOne({ referredUserId: userId, firstPaidAt: { $exists: false } }, { $set: { firstPaidAt: new Date() } });
  await db.collection("referral_discount_reservations").deleteOne({ userId });
  const referral = await col.findOne({ referredUserId: userId });
  if (referral) await tryReward(referral);
}

export async function getReferralOverview(userId: string) {
  const db = await getDb();
  const [rows, rewards] = await Promise.all([
    db.collection<ReferralDoc>("referrals").find({ inviterId: userId }).sort({ createdAt: -1 }).limit(100).toArray(),
    db.collection("referral_rewards").countDocuments({ inviterId: userId }),
  ]);
  return {
    total: rows.length,
    missionCompleted: rows.filter((r) => !!r.missionCompletedAt).length,
    paid: rows.filter((r) => !!r.firstPaidAt).length,
    rewarded: rewards,
    rows: rows.map((r) => ({ createdAt: r.createdAt, missionCompleted: !!r.missionCompletedAt, paid: !!r.firstPaidAt, rewarded: !!r.rewardedAt })),
  };
}

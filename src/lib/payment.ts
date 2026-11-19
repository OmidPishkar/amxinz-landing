import { randomUUID } from "node:crypto";
import { Contract, formatUnits, getAddress, Interface, isAddress, JsonRpcProvider, parseUnits } from "ethers";
import { getDb } from "@/lib/mongodb";
import { markReferralPaid } from "@/lib/referrals";
import { redeemDiscountCode, validateDiscountCode } from "@/lib/discounts";
import { PLAN_CATALOG, TERM_DAYS, type PlanId, type SubscriptionDoc, type SubscriptionPeriod, type TermId } from "@/lib/subscriptions";

export const BSC_CHAIN_ID = 56;
export const PAYMENT_CONFIRMATIONS = 60;
export const PAYMENT_TOKEN = getAddress("0x55d398326f99059fF775485246999027B3197955");
export const PAYMENT_RECIPIENT = getAddress("0x9Db7fa0f5238f64CFBb2f7BbA62967825a896DA6");
const TOKEN_DECIMALS = 18;
const TRANSFER = new Interface(["event Transfer(address indexed from,address indexed to,uint256 value)"]);
const TOKEN_METADATA_ABI = ["function decimals() view returns (uint8)", "function symbol() view returns (string)", "function name() view returns (string)"];

async function assertPaymentToken(rpc: JsonRpcProvider) {
  const token = new Contract(PAYMENT_TOKEN, TOKEN_METADATA_ABI, rpc);
  const [decimals, symbol, name] = await Promise.all([token.decimals(), token.symbol(), token.name()]);
  if (Number(decimals) !== TOKEN_DECIMALS || String(symbol) !== "USDT" || String(name) !== "Tether USD") {
    throw new Error("The configured BEP-20 payment contract did not match the expected USDT token metadata.");
  }
}

export interface InvoiceDoc {
  invoiceId: string;
  userId: string;
  planId: Exclude<PlanId, "free">;
  term: TermId;
  amountUsd: number;
  originalAmountUsd: number;
  discountAmountUsd: number;
  referralDiscountUsd: number;
  discountCode?: string;
  discountPercent?: number;
  amountRaw: string;
  amountToken: string;
  tokenContract: string;
  recipient: string;
  payerAddress: string;
  chainId: number;
  status: "pending" | "confirming" | "paid" | "underpaid" | "overpaid" | "manual_review" | "expired" | "rejected";
  createdAt: Date;
  expiresAt: Date;
  txHash?: string;
  blockNumber?: number;
  confirmations?: number;
  paidAt?: Date;
}

const provider = () => new JsonRpcProvider(process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org", BSC_CHAIN_ID);

export async function createInvoice(userId: string, planId: Exclude<PlanId, "free">, term: TermId, payer: string, rawDiscountCode?: string) {
  if (!isAddress(payer)) throw new Error("Enter a valid BNB Smart Chain wallet address.");
  const originalAmountUsd = PLAN_CATALOG[planId].prices[term];
  const now = new Date();
  const invoiceId = randomUUID();
  const rpc = provider();
  const network = await rpc.getNetwork();
  if (Number(network.chainId) !== BSC_CHAIN_ID) throw new Error("Payment RPC is not connected to BNB Smart Chain.");
  await assertPaymentToken(rpc);
  const db = await getDb();
  let referralDiscountUsd = 0;
  let discountCode: string | undefined;
  let discountPercent: number | undefined;
  let discountAmountUsd = 0;
  if (rawDiscountCode?.trim()) {
    const codeDoc = await validateDiscountCode(rawDiscountCode, planId, term, now);
    discountCode = codeDoc.code;
    discountPercent = codeDoc.percent;
    discountAmountUsd = Math.round(originalAmountUsd * codeDoc.percent / 100 * 100) / 100;
  }
  const referral = !discountCode ? await db.collection("referrals").findOne({ referredUserId: userId, firstPaidAt: { $exists: false } }) : null;
  if (referral) {
    const reservations = db.collection("referral_discount_reservations");
    await Promise.all([
      reservations.createIndex({ userId: 1 }, { unique: true }),
      reservations.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ]);
    const currentReservation = await reservations.findOne({ userId });
    if (currentReservation && new Date(currentReservation.expiresAt).getTime() <= now.getTime()) await reservations.deleteOne({ userId, invoiceId: currentReservation.invoiceId });
    if (!currentReservation || new Date(currentReservation.expiresAt).getTime() <= now.getTime()) {
      try {
        await reservations.insertOne({ userId, invoiceId, createdAt: now, expiresAt: new Date(now.getTime() + 30 * 60 * 1000) });
        referralDiscountUsd = Math.round(originalAmountUsd * 0.1 * 100) / 100;
        discountAmountUsd = referralDiscountUsd;
      } catch (error) {
        if ((error as { code?: number })?.code !== 11000) throw error;
      }
    }
  }
  const amountUsd = Math.max(0, Math.round((originalAmountUsd - discountAmountUsd) * 100) / 100);
  const amountRaw = parseUnits(amountUsd.toFixed(2), TOKEN_DECIMALS).toString();
  const invoice: InvoiceDoc = {
    invoiceId, userId, planId, term, amountUsd, originalAmountUsd, discountAmountUsd, referralDiscountUsd, discountCode, discountPercent, amountRaw, amountToken: formatUnits(amountRaw, TOKEN_DECIMALS),
    tokenContract: PAYMENT_TOKEN, recipient: PAYMENT_RECIPIENT, payerAddress: getAddress(payer),
    chainId: BSC_CHAIN_ID, status: "pending", createdAt: now, expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
  };
  const col = db.collection<InvoiceDoc>("invoices");
  await Promise.all([
    col.createIndex({ invoiceId: 1 }, { unique: true }),
    col.createIndex({ txHash: 1 }, { unique: true, sparse: true }),
    col.createIndex({ userId: 1, createdAt: -1 }),
  ]);
  await col.insertOne(invoice);
  return invoice;
}

async function appendSubscriptionPeriod(invoice: InvoiceDoc) {
  const db = await getDb();
  const col = db.collection<SubscriptionDoc>("subscriptions");
  await col.createIndex({ userId: 1 }, { unique: true });
  let existing = await col.findOne({ userId: invoice.userId });
  if (existing?.periods?.some((p) => p.invoiceId === invoice.invoiceId)) return;

  const now = new Date();
  if (existing && (!existing.periods || existing.periods.length === 0) &&
      ["active", "trialing", "cancelled"].includes(existing.status) &&
      new Date(existing.currentPeriodEnd).getTime() > now.getTime()) {
    const legacyPeriod: SubscriptionPeriod = {
      planId: existing.planId, status: existing.status,
      currentPeriodStart: existing.currentPeriodStart, currentPeriodEnd: existing.currentPeriodEnd,
      startAt: existing.currentPeriodStart, endAt: existing.currentPeriodEnd, createdAt: existing.createdAt, trial: existing.trial,
    };
    await col.updateOne({ userId: invoice.userId, $or: [{ periods: { $exists: false } }, { periods: { $size: 0 } }] }, { $set: { periods: [legacyPeriod] } });
    existing = await col.findOne({ userId: invoice.userId });
  }
  const activePeriods = (existing?.periods ?? []).filter((p) =>
    (p.status === "active" || p.status === "trialing" || p.status === "cancelled") && new Date(p.currentPeriodEnd).getTime() > now.getTime()
  );
  const current = activePeriods
    .filter((p) => new Date(p.currentPeriodStart).getTime() <= now.getTime())
    .sort((a, b) => new Date(b.currentPeriodStart).getTime() - new Date(a.currentPeriodStart).getTime())[0];
  const latestEnd = activePeriods.reduce((max, p) => Math.max(max, new Date(p.currentPeriodEnd).getTime()), now.getTime());
  const duration = TERM_DAYS[invoice.term] * 86400000;
  let start = new Date(Math.max(now.getTime(), latestEnd));
  let end = new Date(start.getTime() + duration);

  const tier = { essential: 1, pro: 2, elite: 3 } as const;
  if (current && tier[invoice.planId] > tier[current.planId]) {
    const remainingMs = Math.max(0, new Date(current.currentPeriodEnd).getTime() - now.getTime());
    const oldMonthly = PLAN_CATALOG[current.planId].prices["1m"];
    const newMonthly = PLAN_CATALOG[invoice.planId].prices["1m"];
    const convertedMs = remainingMs * (oldMonthly / newMonthly);
    start = now;
    end = new Date(now.getTime() + convertedMs + duration);
  } else if (current && tier[invoice.planId] < tier[current.planId]) {
    start = new Date(Math.max(now.getTime(), new Date(current.currentPeriodEnd).getTime()));
    end = new Date(start.getTime() + duration);
  }

  if (current && tier[invoice.planId] > tier[current.planId] && existing?.periods?.length) {
    const endedPeriods = existing.periods.map((p) => {
      const stillRelevant = ["active", "trialing", "cancelled"].includes(p.status) && new Date(p.currentPeriodEnd).getTime() > now.getTime();
      return stillRelevant ? { ...p, status: "expired" as const, currentPeriodEnd: now } : p;
    });
    await col.updateOne({ userId: invoice.userId }, { $set: { periods: endedPeriods } });
  }

  const period: SubscriptionPeriod = {
    planId: invoice.planId, status: "active", currentPeriodStart: start, currentPeriodEnd: end,
    startAt: start, endAt: end, createdAt: now, trial: false, cancelAtPeriodEnd: false, invoiceId: invoice.invoiceId, paymentId: invoice.txHash,
  };
  const filter = { userId: invoice.userId, "periods.invoiceId": { $ne: invoice.invoiceId } };
  try {
    await col.updateOne(filter, {
      $set: { planId: invoice.planId, status: "active", currentPeriodStart: start, currentPeriodEnd: end, trial: false, cancelAtPeriodEnd: false },
      $push: { periods: period },
      $setOnInsert: { createdAt: now },
    }, { upsert: true });
  } catch (error) {
    if ((error as { code?: number })?.code !== 11000) throw error;
    await col.updateOne(filter, {
      $set: { planId: invoice.planId, status: "active", currentPeriodStart: start, currentPeriodEnd: end, trial: false, cancelAtPeriodEnd: false },
      $push: { periods: period },
      $setOnInsert: { createdAt: now },
    });
  }
}

export async function verifyInvoicePayment(userId: string, invoiceId: string, txHashInput: string) {
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHashInput)) throw new Error("Enter a valid transaction hash.");
  const txHash = txHashInput.toLowerCase();
  const db = await getDb();
  const invoices = db.collection<InvoiceDoc>("invoices");
  const invoice = await invoices.findOne({ invoiceId, userId });
  if (!invoice) throw new Error("Invoice not found.");
  if (invoice.status === "rejected") throw new Error("This invoice was rejected during manual review.");
  if (invoice.status === "paid") {
    try { await markReferralPaid(userId); } catch (error) { console.error("referral paid trigger:", error); }
    return { status: "paid" as const, confirmations: invoice.confirmations ?? PAYMENT_CONFIRMATIONS };
  }
  if (invoice.txHash && invoice.txHash.toLowerCase() !== txHash) throw new Error("A different transaction is already attached to this invoice.");

  const rpc = provider();
  const network = await rpc.getNetwork();
  if (Number(network.chainId) !== BSC_CHAIN_ID) throw new Error("Payment verification RPC is not connected to BNB Smart Chain.");
  await assertPaymentToken(rpc);
  const [tx, receipt] = await Promise.all([rpc.getTransaction(txHash), rpc.getTransactionReceipt(txHash)]);
  if (!tx || !receipt) return { status: "pending" as const, confirmations: 0 };
  if (receipt.status !== 1 || !tx.to || getAddress(tx.to) !== PAYMENT_TOKEN) throw new Error("This transaction is not a successful transfer of the supported payment token.");
  if (Number(tx.chainId) !== BSC_CHAIN_ID) throw new Error("Transaction was not sent on BNB Smart Chain.");
  if (getAddress(tx.from) !== getAddress(invoice.payerAddress)) throw new Error("The transaction sender does not match the wallet entered for this invoice.");

  let transfer: { from: string; to: string; value: bigint } | null = null;
  for (const log of receipt.logs) {
    if (getAddress(log.address) !== PAYMENT_TOKEN) continue;
    try {
      const parsed = TRANSFER.parseLog({ topics: [...log.topics], data: log.data });
      if (parsed?.name === "Transfer") {
        const candidate = { from: getAddress(String(parsed.args.from)), to: getAddress(String(parsed.args.to)), value: BigInt(parsed.args.value) };
        if (candidate.to === PAYMENT_RECIPIENT && candidate.from === getAddress(invoice.payerAddress)) transfer = candidate;
      }
    } catch { /* Ignore unrelated token logs. */ }
  }
  if (!transfer) throw new Error("No matching token transfer to the Amxinz payment wallet was found.");
  const expected = BigInt(invoice.amountRaw);
  if (transfer.value < expected) {
    await invoices.updateOne({ invoiceId, userId }, { $set: { status: "underpaid", txHash } });
    return { status: "underpaid" as const, confirmations: 0 };
  }
  if (transfer.value > expected) {
    await invoices.updateOne({ invoiceId, userId }, { $set: { status: "manual_review", txHash } });
    return { status: "manual_review" as const, confirmations: 0 };
  }
  const block = await rpc.getBlock(receipt.blockNumber);
  if (block && block.timestamp * 1000 > invoice.expiresAt.getTime()) {
    await invoices.updateOne({ invoiceId, userId }, { $set: { status: "manual_review", txHash } });
    return { status: "manual_review" as const, confirmations: 0 };
  }
  try {
    await invoices.updateOne(
      { invoiceId, userId, $or: [{ txHash: { $exists: false } }, { txHash }] },
      { $set: { txHash, status: "confirming", blockNumber: receipt.blockNumber } },
    );
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) throw new Error("This transaction hash has already been used.");
    throw error;
  }
  const head = await rpc.getBlockNumber();
  const confirmations = Math.max(0, head - receipt.blockNumber + 1);
  if (confirmations < PAYMENT_CONFIRMATIONS) {
    await invoices.updateOne({ invoiceId, userId, txHash }, { $set: { status: "confirming", confirmations } });
    return { status: "confirming" as const, confirmations };
  }
  const paidAt = new Date();
  const current = await invoices.findOne({ invoiceId, userId });
  if (!current) throw new Error("Invoice not found.");
  if (current.discountCode) {
    const redeemed = await redeemDiscountCode(invoiceId, current.discountCode);
    if (!redeemed) {
      await invoices.updateOne({ invoiceId, userId, txHash }, { $set: { status: "manual_review" } });
      return { status: "manual_review" as const, confirmations };
    }
  }
  await appendSubscriptionPeriod({ ...current, txHash });
  await invoices.updateOne({ invoiceId, userId, txHash }, { $set: { status: "paid", confirmations, paidAt } });
  try { await markReferralPaid(userId); } catch (error) { console.error("referral paid trigger:", error); }
  return { status: "paid" as const, confirmations };
}


export async function reviewInvoiceManually(invoiceId: string, actor: string, decision: "approve" | "reject", reason: string) {
  const db = await getDb();
  const invoices = db.collection<InvoiceDoc>("invoices");
  const invoice = await invoices.findOne({ invoiceId });
  if (!invoice) throw new Error("Invoice not found.");
  if (invoice.status === "paid" || invoice.status === "rejected") throw new Error("This invoice has already been finalized.");
  if (!["manual_review", "underpaid", "overpaid", "confirming"].includes(invoice.status)) throw new Error("This invoice is not awaiting manual review.");
  const before = { status: invoice.status, txHash: invoice.txHash ?? null, amountUsd: invoice.amountUsd, confirmations: invoice.confirmations ?? 0 };
  const now = new Date();
  if (decision === "approve") {
    if (!invoice.txHash) throw new Error("An on-chain transaction hash is required before approval.");
    if (invoice.discountCode) {
      const redeemed = await redeemDiscountCode(invoiceId, invoice.discountCode);
      if (!redeemed) throw new Error("The discount code limit was reached. Resolve the discount before approving this invoice.");
    }
    await appendSubscriptionPeriod(invoice);
    await invoices.updateOne({ invoiceId }, { $set: { status: "paid", paidAt: now, manualReview: { actor, reason, reviewedAt: now } } });
    try { await markReferralPaid(invoice.userId); } catch (error) { console.error("manual referral trigger:", error); }
  } else {
    await invoices.updateOne({ invoiceId }, { $set: { status: "rejected", manualReview: { actor, reason, reviewedAt: now } } });
  }
  const after = { status: decision === "approve" ? "paid" : "rejected", reviewedAt: now };
  await db.collection("admin_audit_logs").insertOne({ actor, at: now, action: decision === "approve" ? "invoice.approved" : "invoice.rejected", targetType: "invoice", targetId: invoiceId, before, after, reason });
  return after;
}

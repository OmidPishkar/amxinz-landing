"use client";
import { useState } from "react";
import { BrowserProvider, Contract, getAddress } from "ethers";

type Plan = "essential" | "pro" | "elite";
type Term = "7d" | "1m" | "3m" | "6m" | "1y";
type Invoice = { invoiceId: string; amountUsd: number; originalAmountUsd: number; discountAmountUsd: number; amountToken: string; amountRaw: string; tokenContract: string; recipient: string; payerAddress: string; chainId: number; expiresAt: string; confirmationsRequired: number };

declare global {
  interface Window { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }
}
const ERC20 = ["function transfer(address to,uint256 amount) returns (bool)"];

export function Checkout({ plan, term }: { plan: Plan; term: Term }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Connect your wallet to create a payment invoice.");
  const [error, setError] = useState("");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [txHash, setTxHash] = useState("");
  const [confirmations, setConfirmations] = useState(0);
  const [discountCode, setDiscountCode] = useState("");

  async function pay() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      if (invoice && txHash) {
        setMessage("Checking your existing transaction…");
        for (let attempt = 0; attempt < 100; attempt += 1) {
          const response = await fetch("/api/billing/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceId: invoice.invoiceId, txHash }), cache: "no-store" });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error ?? "Payment verification failed.");
          setConfirmations(Number(result.confirmations ?? 0));
          if (result.status === "paid") { setMessage("Payment confirmed. Your subscription is now active."); return; }
          if (result.status === "underpaid" || result.status === "manual_review") throw new Error("This payment needs manual review. Keep your transaction hash for support.");
          setMessage(`Payment detected: ${Number(result.confirmations ?? 0)} / ${invoice.confirmationsRequired} confirmations.`);
          await new Promise((resolve) => setTimeout(resolve, 12000));
        }
        setMessage("Your transaction is still confirming. Keep this page open or return later and retry verification.");
        return;
      }
      setMessage("Connecting to MetaMask…");
      const ethereum = window.ethereum;
      if (!ethereum) throw new Error("MetaMask or another EVM wallet was not detected.");
      await ethereum.request({ method: "eth_requestAccounts" });
      try {
        await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x38" }] });
      } catch (switchError) {
        if ((switchError as { code?: number }).code === 4902) throw new Error("Add BNB Smart Chain (chain ID 56) to your wallet, then try again.");
        throw switchError;
      }
      const provider = new BrowserProvider(ethereum as never);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      if (invoice && getAddress(walletAddress) !== getAddress(invoice.payerAddress)) throw new Error("Reconnect the wallet used to create this invoice.");
      if (invoice && Date.now() > new Date(invoice.expiresAt).getTime()) throw new Error("This invoice has expired. Return to pricing and create a new invoice.");
      setMessage("Creating your locked-price invoice…");
      const invoiceResponse = invoice ? null : await fetch("/api/billing/invoices", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, term, walletAddress, discountCode: discountCode.trim() || undefined }),
      });
      const invoiceData = invoiceResponse ? await invoiceResponse.json() : null;
      if (invoiceResponse && !invoiceResponse.ok) throw new Error(invoiceData.error ?? "Could not create invoice.");
      const created = invoice ?? (invoiceData as Invoice);
      if (!created) throw new Error("Could not create invoice.");
      setInvoice(created);
      setMessage("Confirm the token transfer in your wallet. BNB is required for network gas.");
      const token = new Contract(created.tokenContract, ERC20, signer);
      const tx = await token.transfer(getAddress(created.recipient), BigInt(created.amountRaw));
      setTxHash(tx.hash);
      setMessage("Transaction submitted. Waiting for it to be included in a block…");
      await tx.wait(1);
      for (let attempt = 0; attempt < 100; attempt += 1) {
        const response = await fetch("/api/billing/verify", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: created.invoiceId, txHash: tx.hash }),
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Payment verification failed.");
        setConfirmations(Number(result.confirmations ?? 0));
        if (result.status === "paid") {
          setMessage("Payment confirmed. Your subscription is now active.");
          return;
        }
        if (result.status === "underpaid") throw new Error("The transfer amount was lower than the invoice amount. Contact support with your transaction hash.");
        if (result.status === "manual_review") throw new Error("This payment needs a manual review. Keep your transaction hash for support.");
        setMessage(`Payment detected: ${Number(result.confirmations ?? 0)} / ${created.confirmationsRequired} confirmations.`);
        await new Promise((resolve) => setTimeout(resolve, 12000));
      }
      setMessage("Your transaction is still confirming. You can keep this page open; the payment will activate after the required confirmations.");
    } catch (reason) {
  const rawMessage = reason instanceof Error ? reason.message : "";
  const revertReason =
    rawMessage.match(/reason="([^"]+)"/)?.[1] ??
    rawMessage.match(/execution reverted:\s*"([^"]+)"/)?.[1];

  setError(revertReason ?? rawMessage ?? "Payment could not be completed.");
}finally {
      setBusy(false);
    }
  }

  return <section className="mx-auto max-w-xl rounded-2xl border p-6 sm:p-8">
    <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Secure checkout</p><h1 className="mt-2 text-2xl font-semibold capitalize">{plan} plan</h1></div><p className="text-sm text-muted-foreground">{term}</p></div>
    <div className="mt-6 rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">Payment network</p><p className="mt-1 font-medium">BNB Smart Chain · BEP-20</p><p className="mt-3 text-xs text-muted-foreground">Payment token</p><p className="mt-1 font-medium">USDT (BEP-20)</p><p className="mt-3 text-xs text-muted-foreground">Required confirmations</p><p className="mt-1 font-medium">60 network confirmations</p></div>
    {!invoice && <label className="mt-5 block text-xs font-medium text-muted-foreground">Discount code (optional) <input value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} placeholder="Enter code" className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground uppercase" /></label>}
    {invoice && <div className="mt-4 rounded-xl border p-4"><p className="text-xs text-muted-foreground">Invoice amount (locked)</p><p className="mt-1 text-3xl font-semibold tabular-nums">{invoice.amountToken} <span className="text-base">USDT</span></p><p className="mt-1 text-xs text-muted-foreground">{invoice.discountAmountUsd > 0 ? <>Original: ${invoice.originalAmountUsd.toFixed(2)} · Referral discount: -${invoice.discountAmountUsd.toFixed(2)} · </> : null}Total: ${invoice.amountUsd.toFixed(2)} USD</p><p className="mt-2 break-all text-xs text-muted-foreground">Recipient: {invoice.recipient}</p><p className="mt-1 text-xs text-muted-foreground">Expires: {new Date(invoice.expiresAt).toLocaleString()}</p></div>}
    <p className="mt-5 text-sm text-muted-foreground" role="status">{message}</p>
    {txHash && <p className="mt-2 break-all text-xs text-muted-foreground">Transaction: {txHash}</p>}
    {confirmations > 0 && <p className="mt-2 text-xs text-muted-foreground">{confirmations} / 60 confirmations</p>}
    {error && <p role="alert" className="mt-4 rounded-lg border border-red-500/30 p-3 text-sm text-red-600">{error}</p>}
    <button type="button" disabled={busy} onClick={pay} className="mt-6 w-full rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Processing payment…" : invoice && txHash ? "Retry verification" : invoice ? "Continue payment" : "Connect wallet & pay"}</button>
    <p className="mt-4 text-xs leading-5 text-muted-foreground">Never share your seed phrase or private key. This checkout only requests a token transfer and does not require AMXINZ to access your wallet keys. Make sure the token contract and amount shown in your wallet match the invoice.</p>
  </section>;
}

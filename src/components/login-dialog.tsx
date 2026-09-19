"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

export function LoginDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"google" | "wallet" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function google() {
    setError(null);
    setBusy("google");
    await signIn("google", { callbackUrl: "/" });
  }

  async function wallet() {
    setError(null);
    setBusy("wallet");
    try {
      const ethereum = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
      if (!ethereum) throw new Error("No wallet found. Install MetaMask or another EVM wallet.");

      const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const address = accounts[0];

      const res = await fetch("/api/wallet/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start wallet login.");

      const signature = await ethereum.request({
        method: "personal_sign",
        params: [data.message, address],
      });

      const result = await signIn("wallet", { address, signature, redirect: false });
      if (result?.error) throw new Error("The signature could not be verified. Try again.");

      setOpen(false);
      router.refresh();
    } catch (err) {
      const rejected = (err as { code?: number })?.code === 4001;
      setError(
        rejected
          ? "You rejected the request in your wallet."
          : err instanceof Error
            ? err.message
            : "Wallet login failed.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Log in to Amxinz</DialogTitle>
        <DialogDescription>Choose how you want to sign in. You can play right after.</DialogDescription>

        <div className="mt-4 flex flex-col gap-2">
          <Button variant="outline" size="lg" onClick={google} disabled={busy !== null}>
            {busy === "google" ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </Button>
          <Button variant="outline" size="lg" onClick={wallet} disabled={busy !== null}>
            {busy === "wallet" ? <Loader2 className="animate-spin" /> : <Wallet />}
            Sign in with wallet
          </Button>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-[13px] text-destructive">
            {error}
          </p>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Wallet login asks for a signature only. It never sends a transaction or costs gas.
        </p>
      </DialogContent>
    </Dialog>
  );
}

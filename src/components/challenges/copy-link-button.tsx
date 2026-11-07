"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url); // clipboard blocked (e.g. in-app browsers)
    }
  }

  return (
    <Button variant="outline" onClick={copy}>
      {copied ? <Check /> : <Link2 />}
      {copied ? "Link copied" : "Copy challenge link"}
    </Button>
  );
}

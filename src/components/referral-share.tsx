"use client";
import { useState } from "react";
export function ReferralShare({url,code}:{url:string;code:string}){
 const [copied,setCopied]=useState(false);
 async function copy(){try{await navigator.clipboard.writeText(url);setCopied(true);}catch{setCopied(false);}}
 return <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Your code</p><p className="mt-1 font-mono text-lg font-semibold">{code}</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input readOnly value={url} className="min-w-0 flex-1 rounded-lg border bg-muted px-3 py-2 text-sm"/><button type="button" onClick={copy} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">{copied?"Copied":"Copy link"}</button></div></div>;
}

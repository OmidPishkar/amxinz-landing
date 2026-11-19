"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function InvoiceReview({invoiceId,status}:{invoiceId:string;status:string}){
 const [reason,setReason]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const router=useRouter();
 if(!["manual_review","underpaid","overpaid","confirming"].includes(status))return null;
 async function submit(decision:"approve"|"reject"){
  if(reason.trim().length<10){setError("Add a review reason of at least 10 characters.");return;}
  setBusy(true);setError("");
  try{const r=await fetch("/api/admin/invoices/review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({invoiceId,decision,reason})});const d=await r.json();if(!r.ok)throw new Error(d.error??"Review failed.");router.refresh();}
  catch(e){setError(e instanceof Error?e.message:"Review failed.");}finally{setBusy(false);}
 }
 return <div className="min-w-[220px]"><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Review reason (required)" className="w-full rounded-md border bg-background px-2 py-1.5 text-xs text-foreground"/><div className="mt-2 flex gap-2"><button type="button" disabled={busy} onClick={()=>submit("approve")} className="rounded-md bg-violet-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Approve</button><button type="button" disabled={busy} onClick={()=>submit("reject")} className="rounded-md border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50">Reject</button></div>{error&&<p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}</div>;
}

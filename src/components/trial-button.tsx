"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function TrialButton(){
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");const router=useRouter();
 async function start(){if(busy)return;setBusy(true);setError("");try{const response=await fetch("/api/billing/trial",{method:"POST"});const data=await response.json();if(!response.ok)throw new Error(data.error??"Could not start the trial.");router.refresh();}catch(reason){setError(reason instanceof Error?reason.message:"Could not start the trial.");}finally{setBusy(false);}}
 return <div><button type="button" onClick={start} disabled={busy} className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60">{busy?"Starting…":"Start free trial"}</button>{error&&<p role="alert" className="mt-2 max-w-xs text-xs text-red-600">{error}</p>}</div>;
}

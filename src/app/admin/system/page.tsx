import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
import { HAS_IFRAME_AD } from "@/lib/ads";
import { BSC_CHAIN_ID,PAYMENT_RECIPIENT,PAYMENT_TOKEN } from "@/lib/payment";
import { AdminToolsNav } from "@/components/admin/admin-tools-nav";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"System Configuration · Admin",robots:{index:false,follow:false}};
export default async function AdminSystemPage(){
 const session=await getServerSession(authOptions);if(!(await isAdminSession(session)))notFound();
 let database="Unavailable";try{await(await getDb()).command({ping:1});database="Connected";}catch{}
 const rows=[["Database",database],["A-ADS unit",HAS_IFRAME_AD?"Configured":"Not configured"],["Payment network","BNB Smart Chain · "+BSC_CHAIN_ID],["Payment token contract",PAYMENT_TOKEN],["Payment recipient",PAYMENT_RECIPIENT],["BSC RPC override",process.env.BSC_RPC_URL?"Configured":"Using default RPC"],["Resend email",process.env.RESEND_API_KEY?"Configured":"Not configured"],["Google OAuth",process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET?"Configured":"Not configured"]];
 return <div className="mx-auto max-w-5xl px-4 py-10"><div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">System Configuration</h1><Link href="/admin" className="text-sm underline">Admin overview</Link></div><AdminToolsNav/><div className="mt-6 divide-y rounded-xl border">{rows.map(([label,value])=><div key={label} className="flex flex-wrap justify-between gap-2 p-4"><span className="text-sm text-muted-foreground">{label}</span><span className="break-all text-sm font-medium">{value}</span></div>)}</div><p className="mt-5 text-xs text-muted-foreground">Secret values are never displayed. A configured RPC or token address does not by itself confirm payment readiness; verify the contract and run a small test payment before enabling live purchases.</p></div>;
}

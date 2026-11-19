import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
import { AdminToolsNav } from "@/components/admin/admin-tools-nav";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Audit Logs · Admin",robots:{index:false,follow:false}};
export default async function AdminAuditPage(){
 const session=await getServerSession(authOptions);if(!(await isAdminSession(session)))notFound();
 const rows=await(await getDb()).collection("admin_audit_logs").find({}).sort({at:-1}).limit(200).toArray();
 return <div className="mx-auto max-w-6xl px-4 py-10"><div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">System & Audit Logs</h1><Link href="/admin" className="text-sm underline">Admin overview</Link></div><AdminToolsNav/><div className="mt-6 overflow-x-auto rounded-xl border"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-muted"><tr>{["Time","Actor","Action","Target","Reason","Before / after"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={String(r._id)} className="border-t align-top"><td className="p-3">{new Date(r.at).toLocaleString("en-GB")}</td><td className="p-3">{r.actor}</td><td className="p-3 font-medium">{r.action}</td><td className="p-3">{r.targetType}:{r.targetId}</td><td className="max-w-[220px] p-3">{r.reason}</td><td className="max-w-[320px] p-3"><pre className="whitespace-pre-wrap break-all text-[10px]">{JSON.stringify({before:r.before,after:r.after},null,2)}</pre></td></tr>)}</tbody></table>{!rows.length&&<p className="p-4 text-sm text-muted-foreground">No audit events have been recorded.</p>}</div></div>;
}

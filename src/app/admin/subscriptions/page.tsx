import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
import { AdminToolsNav } from "@/components/admin/admin-tools-nav";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Subscriptions · Admin",robots:{index:false,follow:false}};
export default async function AdminSubscriptionsPage(){
 const session=await getServerSession(authOptions);if(!(await isAdminSession(session)))notFound();
 const rows=await(await getDb()).collection("subscriptions").find({}).sort({currentPeriodEnd:-1}).limit(200).toArray();
 return <div className="mx-auto max-w-6xl px-4 py-10"><div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Subscriptions & Plans</h1><Link href="/admin" className="text-sm underline">Admin overview</Link></div><AdminToolsNav/><div className="mt-6 overflow-x-auto rounded-xl border"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-muted"><tr>{["User","Plan","Status","Start","End","Trial","Periods"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{rows.map(s=><tr key={String(s.userId)} className="border-t"><td className="p-3 font-mono text-xs">{s.userId}</td><td className="p-3 capitalize">{s.planId}</td><td className="p-3 capitalize">{s.status}</td><td className="p-3">{new Date(s.currentPeriodStart).toLocaleDateString("en-GB")}</td><td className="p-3">{new Date(s.currentPeriodEnd).toLocaleDateString("en-GB")}</td><td className="p-3">{s.trial?"Yes":"No"}</td><td className="p-3">{s.periods?.length??0}</td></tr>)}</tbody></table></div></div>;
}

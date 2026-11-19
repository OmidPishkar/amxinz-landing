import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
import { AdminToolsNav } from "@/components/admin/admin-tools-nav";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Referral Management · Admin",robots:{index:false,follow:false}};
export default async function AdminReferralsPage(){
 const session=await getServerSession(authOptions);if(!(await isAdminSession(session)))notFound();
 const db=await getDb();const [rows,rewards]=await Promise.all([db.collection("referrals").find({}).sort({createdAt:-1}).limit(200).toArray(),db.collection("referral_rewards").countDocuments({})]);
 return <div className="mx-auto max-w-6xl px-4 py-10"><div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Referral Management</h1><Link href="/admin" className="text-sm underline">Admin overview</Link></div><AdminToolsNav/><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Attributed referrals</p><p className="mt-1 text-2xl font-semibold">{rows.length}</p></div><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Mission completed</p><p className="mt-1 text-2xl font-semibold">{rows.filter(r=>!!r.missionCompletedAt).length}</p></div><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Pro rewards issued</p><p className="mt-1 text-2xl font-semibold">{rewards}</p></div></div><div className="mt-6 overflow-x-auto rounded-xl border"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-muted"><tr>{["Inviter","Referred user","Code","Joined","Mission","First payment","Rewarded"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={String(r.referredUserId)} className="border-t"><td className="p-3 font-mono text-xs">{r.inviterId}</td><td className="p-3 font-mono text-xs">{r.referredUserId}</td><td className="p-3 font-mono">{r.code}</td><td className="p-3">{new Date(r.createdAt).toLocaleDateString("en-GB")}</td><td className="p-3">{r.missionCompletedAt?"Yes":"No"}</td><td className="p-3">{r.firstPaidAt?"Yes":"No"}</td><td className="p-3">{r.rewardedAt?"Yes":"No"}</td></tr>)}</tbody></table></div></div>;
}

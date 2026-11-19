import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
import { AdminToolsNav } from "@/components/admin/admin-tools-nav";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"User Management · Admin",robots:{index:false,follow:false}};
export default async function AdminUsersPage(){
 const session=await getServerSession(authOptions);if(!(await isAdminSession(session)))notFound();
 const db=await getDb();const users=await db.collection("users").find({}, {projection:{providerId:0}}).sort({createdAt:-1}).limit(100).toArray();const ids=users.map(u=>u._id.toString());
 const [subs,progress]=await Promise.all([db.collection("subscriptions").find({userId:{$in:ids}}).toArray(),db.collection("user_progress").find({userId:{$in:ids}}).toArray()]);
 const subMap=new Map(subs.map(s=>[s.userId,s]));const progressMap=new Map(progress.map(p=>[p.userId,p]));
 return <div className="mx-auto max-w-6xl px-4 py-10"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">User Management</h1><p className="mt-1 text-sm text-muted-foreground">Latest 100 accounts · provider identifiers are not displayed.</p></div><Link href="/admin" className="text-sm underline">Admin overview</Link></div><AdminToolsNav/><div className="mt-6 overflow-x-auto rounded-xl border"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-muted"><tr>{["User","Email status","Provider","Plan","XP","Streak","Joined"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{users.map(u=>{const id=u._id.toString();const sub=subMap.get(id);const prog=progressMap.get(id);const active=!!sub&&["active","trialing","cancelled"].includes(String(sub.status))&&new Date(sub.currentPeriodEnd).getTime()>Date.now();return <tr key={id} className="border-t"><td className="p-3">{u.username?"@"+u.username:u.name}</td><td className="p-3">{u.emailVerified?"Verified":"Unverified"}</td><td className="p-3 capitalize">{u.provider}</td><td className="p-3">{active?sub?.planId:"Free"}</td><td className="p-3">{prog?.xp??0}</td><td className="p-3">{prog?.streak??0}</td><td className="p-3">{new Date(u.createdAt).toLocaleDateString("en-GB")}</td></tr>})}</tbody></table></div></div>;
}

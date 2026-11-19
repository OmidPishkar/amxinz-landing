import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
import { AdminToolsNav } from "@/components/admin/admin-tools-nav";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Skills Analytics · Admin",robots:{index:false,follow:false}};
export default async function AdminSkillsPage(){
 const session=await getServerSession(authOptions);if(!(await isAdminSession(session)))notFound();
 const rows=await(await getDb()).collection("skill_events").aggregate([{$group:{_id:"$skill",samples:{$sum:1},correct:{$sum:{$cond:["$correct",1,0]}},quality:{$avg:"$quality"}}},{$sort:{samples:-1}}]).toArray();
 return <div className="mx-auto max-w-5xl px-4 py-10"><div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Skills Analytics</h1><Link href="/admin" className="text-sm underline">Admin overview</Link></div><AdminToolsNav/><div className="mt-6 overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><thead className="bg-muted"><tr>{["Skill","Samples","Correct","Accuracy","Average signal quality"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={String(r._id)} className="border-t"><td className="p-3 capitalize">{r._id}</td><td className="p-3">{r.samples}</td><td className="p-3">{r.correct}</td><td className="p-3">{Math.round(r.correct/r.samples*100)}%</td><td className="p-3">{Number(r.quality??0).toFixed(2)} / 5</td></tr>)}</tbody></table></div></div>;
}

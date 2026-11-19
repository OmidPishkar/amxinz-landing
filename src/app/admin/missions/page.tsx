import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
import { AdminToolsNav } from "@/components/admin/admin-tools-nav";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Missions & Scenarios · Admin",robots:{index:false,follow:false}};
export default async function AdminMissionsPage(){
 const session=await getServerSession(authOptions);if(!(await isAdminSession(session)))notFound();const db=await getDb();
 const [daily,dailyAnswers,personal,risk,inventory]=await Promise.all([db.collection("daily_missions").countDocuments({}),db.collection("daily_mission_entries").countDocuments({}),db.collection("personal_mission_completions").countDocuments({}),db.collection("risk_lab_sessions").countDocuments({status:"completed"}),db.collection("scenario_usage").countDocuments({})]);
 const stats=[["Daily mission sets",daily],["Daily answers",dailyAnswers],["Personal mission completions",personal],["Risk Lab completions",risk],["Reserved unique scenarios",inventory]];
 return <div className="mx-auto max-w-5xl px-4 py-10"><div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Missions & Scenarios</h1><Link href="/admin" className="text-sm underline">Admin overview</Link></div><AdminToolsNav/><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{stats.map(([label,value])=><div key={label} className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p></div>)}</div><p className="mt-6 text-xs text-muted-foreground">Scenario inventory includes unique windows and similarity-filtered historical patterns across Main Game, Daily Mission, Challenges, Personal Missions and Risk Lab.</p></div>;
}

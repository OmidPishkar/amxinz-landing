import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DailyMission } from "@/components/daily-mission";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Daily Mission · Amxinz",robots:{index:false,follow:false}};
export default async function DailyMissionPage(){const session=await getServerSession(authOptions);if(!session?.user?.id)redirect("/");return <div className="mx-auto max-w-4xl px-4 py-12"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Daily training</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Daily Mission</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Five historical scenarios shared by every participant each UTC day. The same charts appear in the same order. Your choice is recorded before the future is revealed.</p><div className="mt-8"><DailyMission/></div></div>}

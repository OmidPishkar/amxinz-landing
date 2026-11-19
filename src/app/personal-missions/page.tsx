import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PersonalMission } from "@/components/personal-mission";
import { getEntitlement } from "@/lib/subscriptions";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Personal Missions · Amxinz",robots:{index:false,follow:false}};
export default async function PersonalMissionsPage(){const session=await getServerSession(authOptions);if(!session?.user?.id)redirect("/");const entitlement=await getEntitlement(session.user.id);if(!["pro","elite"].includes(entitlement.planId))return <div className="mx-auto max-w-2xl px-4 py-16 text-center"><h1 className="text-3xl font-semibold">Personal Missions</h1><p className="mt-3 text-sm text-muted-foreground">Adaptive Personal Missions are available on Pro and Elite plans.</p><Link href="/pricing" className="mt-6 inline-flex rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white">Explore plans</Link></div>;return <div className="mx-auto max-w-4xl px-4 py-12"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Adaptive practice</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Personal Missions</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Your mission targets a skill area where your recorded evidence shows the greatest need for improvement. Amxinz will not generate a mission until there is enough reliable evidence.</p><div className="mt-8"><PersonalMission/></div></div>}

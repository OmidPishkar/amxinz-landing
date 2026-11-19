import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RiskLab } from "@/components/risk-lab";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Risk Lab · Amxinz",robots:{index:false,follow:false}};
export default async function RiskLabPage(){const session=await getServerSession(authOptions);if(!session?.user?.id)redirect("/");return <div className="mx-auto max-w-4xl px-4 py-12"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Risk practice</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Risk Lab</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Practice Long and Short plans with stop-loss and take-profit levels on historical market data. This is a simulation, not a live order.</p><div className="mt-8"><RiskLab/></div></div>}

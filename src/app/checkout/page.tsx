import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { PLAN_CATALOG,type PlanId,type TermId } from "@/lib/subscriptions";
import { Checkout } from "@/components/checkout";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Checkout · Amxinz",robots:{index:false,follow:false}};
const plans=["essential","pro","elite"];const terms=["7d","1m","3m","6m","1y"];
export default async function CheckoutPage({searchParams}:{searchParams:Promise<{plan?:string;term?:string}>}){
 const session=await getServerSession(authOptions);if(!session?.user?.id)redirect("/");
 const user=await getUserById(session.user.id);if(!user?.emailVerified)redirect("/profile?email=required");
 const params=await searchParams;const plan=params.plan as Exclude<PlanId,"free">;const term=params.term as TermId;
 if(!plans.includes(plan)||!terms.includes(term))redirect("/pricing");
 return <div className="mx-auto max-w-3xl px-4 py-14"><div className="mb-8 text-center"><h1 className="text-3xl font-semibold tracking-tight">Complete your subscription</h1><p className="mt-2 text-sm text-muted-foreground">{PLAN_CATALOG[plan].name} · {term} · ${PLAN_CATALOG[plan].prices[term].toFixed(2)} USD before applicable discounts</p></div><Checkout plan={plan} term={term}/></div>;
}

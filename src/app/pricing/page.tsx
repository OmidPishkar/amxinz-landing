import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { PLAN_CATALOG,type PlanId,type TermId } from "@/lib/subscriptions";
import { TrialButton } from "@/components/trial-button";
import { pageMetadata } from "@/lib/seo";
export const metadata:Metadata=pageMetadata({title:"Plans & pricing",description:"Compare Free, Essential, Pro and Elite trading practice plans, with USD pricing and a 14-day full-feature trial.",path:"/pricing"});
const paidPlans:Exclude<PlanId,"free">[]=["essential","pro","elite"];
const terms:{id:TermId;label:string}[]=[{id:"7d",label:"7 days"},{id:"1m",label:"1 month"},{id:"3m",label:"3 months"},{id:"6m",label:"6 months"},{id:"1y",label:"1 year"}];
const features=[
 ["Historical chart practice","Guest access","Unlimited","Unlimited","Unlimited"],
 ["Daily Mission","Core access","Core access","Full access","Full access"],
 ["Skill overview","—","Basic","Full assessment","Advanced assessment"],
 ["Personal Missions","—","—","Adaptive","Adaptive + advanced"],
 ["Weekly Reports","—","—","Included","Detailed"],
 ["Risk Lab","Core tools","Core tools","Full analysis","Advanced analysis"],
 ["History & exports","Basic","Full history","Extended history","Advanced exports"],
 ["Ads","A-ADS supported","Ad-free","Ad-free","Ad-free"]
];
export default async function PricingPage(){
 const session=await getServerSession(authOptions);const user=session?.user?.id?await getUserById(session.user.id):null;
 return <div className="mx-auto max-w-6xl px-4 py-14"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Plans</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Practice at your own pace.</h1><p className="mt-4 max-w-2xl text-muted-foreground">Start free, or unlock deeper skill analysis and personalized training. All prices are in USD. Payments are made in USDT (BEP-20) on BNB Smart Chain.</p>
 <section className="mt-8 rounded-2xl border p-5 sm:flex sm:items-center sm:justify-between"><div><p className="font-semibold">Try every paid feature free for 14 days</p><p className="mt-1 text-sm text-muted-foreground">One trial per account, after email verification. No payment details required. Active trials are ad-free.</p></div><div className="mt-4 sm:mt-0">{session?.user?.id?user?.emailVerified?<TrialButton/>:<Link href="/profile?email=required" className="inline-flex rounded-lg border px-4 py-2.5 text-sm font-semibold">Verify email first</Link>:<Link href="/api/auth/signin" className="inline-flex rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">Sign in to start trial</Link>}</div></section>
 <div className="mt-10 grid gap-4 lg:grid-cols-3">{paidPlans.map(id=>{const plan=PLAN_CATALOG[id];return <article key={id} className="flex flex-col rounded-2xl border p-5"><div><h2 className="text-xl font-semibold">{plan.name}</h2><p className="mt-1 min-h-10 text-sm text-muted-foreground">{plan.description}</p></div><div className="mt-5 space-y-2">{terms.map(term=><div key={term.id} className="flex items-center justify-between gap-3 border-b py-2 text-sm"><span className="text-muted-foreground">{term.label}</span><span className="font-semibold tabular-nums">${plan.prices[term.id].toFixed(2)}</span><Link href={"/checkout?plan="+id+"&term="+term.id} className="text-xs font-semibold text-violet-600">Choose</Link></div>)}</div><p className="mt-auto pt-4 text-xs text-muted-foreground">One-time prepaid term · no automatic renewal</p></article>})}</div>
 <section className="mt-12"><h2 className="text-2xl font-semibold">Compare plans</h2><div className="mt-4 overflow-x-auto rounded-xl border"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-muted"><tr>{["Feature","Free","Essential","Pro","Elite"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{features.map(row=><tr key={row[0]} className="border-t">{row.map((cell,i)=><td key={i} className={i===0?"p-3 font-medium":"p-3 text-muted-foreground"}>{cell}</td>)}</tr>)}</tbody></table></div></section>
 <p className="mt-8 text-xs text-muted-foreground">A subscription activates after the exact BEP-20 token transfer is verified on BNB Smart Chain and reaches 60 network confirmations. A compatible wallet and a small amount of BNB for network gas are required to pay.</p></div>;
}

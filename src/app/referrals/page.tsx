import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureReferralCode,getReferralOverview } from "@/lib/referrals";
import { ReferralShare } from "@/components/referral-share";
import { SITE_URL } from "@/config/site";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Referrals · Amxinz",robots:{index:false,follow:false}};
export default async function ReferralsPage(){
 const session=await getServerSession(authOptions);if(!session?.user?.id)redirect("/");
 const [code,stats]=await Promise.all([ensureReferralCode(session.user.id),getReferralOverview(session.user.id)]);
 const url=SITE_URL+"/?ref="+code;
 return <div className="mx-auto max-w-4xl px-4 py-12"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Invite traders</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Your referral link</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Invite someone new to Amxinz. When they verify their email, complete their first Daily Mission and make their first successful subscription payment, you receive 7 days of Pro credit. They receive 10% off their first paid subscription.</p><div className="mt-6"><ReferralShare url={url} code={code}/></div><div className="mt-8 grid gap-3 sm:grid-cols-4">{[["Invited",stats.total],["Mission completed",stats.missionCompleted],["First payment",stats.paid],["Rewards earned",stats.rewarded]].map(([label,value])=><div key={label} className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>)}</div><div className="mt-8 flex items-center justify-between"><h2 className="font-semibold">Referral activity</h2><Link href="/profile" className="text-sm underline">Back to profile</Link></div><div className="mt-3 divide-y rounded-xl border">{stats.rows.map((r,i)=><div key={i} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"><span>Invite #{stats.rows.length-i}</span><span className="text-muted-foreground">{r.createdAt.toLocaleDateString("en-GB")}</span><span>{r.missionCompleted?"Mission complete":"Mission pending"}</span><span>{r.paid?"Paid":"Payment pending"}</span><span>{r.rewarded?"Rewarded":"Not yet rewarded"}</span></div>)}{!stats.rows.length&&<p className="p-4 text-sm text-muted-foreground">No referrals yet. Share your link to get started.</p>}</div></div>;
}

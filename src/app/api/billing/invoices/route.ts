import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { createInvoice } from "@/lib/payment";
import { rateLimit } from "@/lib/rate-limit";
import type { PlanId,TermId } from "@/lib/subscriptions";
export const dynamic="force-dynamic";
const plans=["essential","pro","elite"];const terms=["7d","1m","3m","6m","1y"];
export async function POST(req:Request){
 const session=await getServerSession(authOptions);if(!session?.user?.id)return NextResponse.json({error:"Sign in before purchasing a plan."},{status:401});
 try { if (!(await rateLimit("billing:create:"+session.user.id, 5, 3600))) return NextResponse.json({error:"Too many invoice requests. Please try again later."},{status:429}); } catch { return NextResponse.json({error:"Billing is temporarily unavailable. Please try again."},{status:503}); }
 const user=await getUserById(session.user.id);if(!user?.emailVerified)return NextResponse.json({error:"Verify your email before purchasing a subscription."},{status:403});
 const body=await req.json().catch(()=>null);const plan=body?.plan as PlanId;const term=body?.term as TermId;const walletAddress=typeof body?.walletAddress==="string"?body.walletAddress:"";const discountCode=typeof body?.discountCode==="string"?body.discountCode:undefined;
 if(!plans.includes(plan)||!terms.includes(term))return NextResponse.json({error:"Choose a valid plan and billing term."},{status:400});
 try{const invoice=await createInvoice(session.user.id,plan as Exclude<PlanId,"free">,term,walletAddress,discountCode);return NextResponse.json({invoiceId:invoice.invoiceId,plan:invoice.planId,term:invoice.term,amountUsd:invoice.amountUsd,originalAmountUsd:invoice.originalAmountUsd,discountAmountUsd:invoice.discountAmountUsd,referralDiscountUsd:invoice.referralDiscountUsd,discountCode:invoice.discountCode,amountToken:invoice.amountToken,amountRaw:invoice.amountRaw,tokenContract:invoice.tokenContract,recipient:invoice.recipient,payerAddress:invoice.payerAddress,chainId:invoice.chainId,expiresAt:invoice.expiresAt.toISOString(),confirmationsRequired:60});}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not create invoice."},{status:400});}
}

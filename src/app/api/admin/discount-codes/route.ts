import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
import type { DiscountCodeDoc } from "@/lib/discounts";
import type { PlanId,TermId } from "@/lib/subscriptions";
export const dynamic="force-dynamic";
export async function GET(){
 const session=await getServerSession(authOptions);if(!(await isAdminSession(session)))return NextResponse.json({error:"Forbidden."},{status:403});const db=await getDb();
 const [codes,revenue]=await Promise.all([db.collection<DiscountCodeDoc>("discount_codes").find({}).sort({createdAt:-1}).toArray(),db.collection("invoices").aggregate([{$match:{status:"paid",discountCode:{$type:"string"}}},{$group:{_id:"$discountCode",revenueUsd:{$sum:"$amountUsd"},discountUsd:{$sum:"$discountAmountUsd"},uses:{$sum:1}}}]).toArray()]);
 const stats=new Map(revenue.map(r=>[r._id,r]));return NextResponse.json(codes.map(c=>({...c,revenue:stats.get(c.code)??{revenueUsd:0,discountUsd:0,uses:0}})));
}
export async function POST(req:Request){
 const session=await getServerSession(authOptions);if(!(await isAdminSession(session)))return NextResponse.json({error:"Forbidden."},{status:403});
 const body=await req.json().catch(()=>null);const code=typeof body?.code==="string"?body.code.trim().toUpperCase():"";const percent=Number(body?.percent);const maxUses=body?.maxUses===""||body?.maxUses==null?null:Number(body.maxUses);
 const startsAt=new Date(body?.startsAt);const endsAt=new Date(body?.endsAt);if(Number.isFinite(endsAt.getTime()))endsAt.setUTCHours(23,59,59,999);
 const plans=Array.isArray(body?.eligiblePlans)?body.eligiblePlans.filter((p:string)=>["essential","pro","elite"].includes(p)) as Exclude<PlanId,"free">[]:[];const terms=Array.isArray(body?.eligibleTerms)?body.eligibleTerms.filter((t:string)=>["7d","1m","3m","6m","1y"].includes(t)) as TermId[]:[];
 if(!/^[A-Z0-9-]{3,24}$/.test(code)||!Number.isFinite(percent)||percent<1||percent>90||(maxUses!==null&&(!Number.isInteger(maxUses)||maxUses<1))||!Number.isFinite(startsAt.getTime())||!Number.isFinite(endsAt.getTime())||endsAt<=startsAt||!plans.length||!terms.length)return NextResponse.json({error:"Check the code, discount, dates, usage limit, plans and terms."},{status:400});
 const db=await getDb();const col=db.collection<DiscountCodeDoc>("discount_codes");await col.createIndex({code:1},{unique:true});const now=new Date();const doc={code,percent,startsAt,endsAt,maxUses,uses:0,eligiblePlans:plans,eligibleTerms:terms,enabled:true,createdAt:now,createdBy:session?.user?.email??"admin"};
 try{await col.insertOne(doc);await db.collection("admin_audit_logs").insertOne({actor:session?.user?.email??session?.user?.id??"admin",at:now,action:"discount.created",targetType:"discount_code",targetId:code,before:null,after:doc,reason:"Created via admin discount manager"});return NextResponse.json({ok:true});}
 catch(error){if((error as {code?:number})?.code===11000)return NextResponse.json({error:"That discount code already exists."},{status:409});return NextResponse.json({error:"Could not create discount code."},{status:500});}
}

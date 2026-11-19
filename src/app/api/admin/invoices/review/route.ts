import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { reviewInvoiceManually } from "@/lib/payment";
export const dynamic="force-dynamic";
export async function POST(req:Request){
 const session=await getServerSession(authOptions);if(!(await isAdminSession(session)))return NextResponse.json({error:"Forbidden."},{status:403});
 const body=await req.json().catch(()=>null);const invoiceId=typeof body?.invoiceId==="string"?body.invoiceId:"";const decision=body?.decision;const reason=typeof body?.reason==="string"?body.reason.trim():"";
 if(!invoiceId||!["approve","reject"].includes(decision)||reason.length<10||reason.length>500)return NextResponse.json({error:"Invoice, decision and a 10–500 character review reason are required."},{status:400});
 try{const result=await reviewInvoiceManually(invoiceId,session?.user?.email??session?.user?.id??"admin",decision,reason);return NextResponse.json({ok:true,result});}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not review invoice."},{status:400});}
}

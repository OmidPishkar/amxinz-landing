import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyInvoicePayment } from "@/lib/payment";
import { rateLimit } from "@/lib/rate-limit";
export const dynamic="force-dynamic";
export async function POST(req:Request){
 const session=await getServerSession(authOptions);if(!session?.user?.id)return NextResponse.json({error:"Sign in to verify a payment."},{status:401});
 try { if (!(await rateLimit("billing:verify:"+session.user.id, 12, 300))) return NextResponse.json({error:"Too many verification attempts. Please wait before trying again."},{status:429}); } catch { return NextResponse.json({error:"Payment verification is temporarily unavailable."},{status:503}); }
 const body=await req.json().catch(()=>null);const invoiceId=typeof body?.invoiceId==="string"?body.invoiceId:"";const txHash=typeof body?.txHash==="string"?body.txHash:"";
 if(!invoiceId||!txHash)return NextResponse.json({error:"Invoice ID and transaction hash are required."},{status:400});
 try{const result=await verifyInvoicePayment(session.user.id,invoiceId,txHash);return NextResponse.json({...result,confirmationsRequired:60});}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not verify the transaction."},{status:400});}
}

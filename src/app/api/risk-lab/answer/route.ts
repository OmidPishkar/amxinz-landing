import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { submitRiskAnswer } from "@/lib/risk-lab";
export const dynamic="force-dynamic";
export async function POST(req:Request){
 const session=await getServerSession(authOptions);if(!session?.user?.id)return NextResponse.json({error:"Sign in to use Risk Lab."},{status:401});
 const body=await req.json().catch(()=>null);const side=body?.side;if(side!=="long"&&side!=="short")return NextResponse.json({error:"Choose Long or Short."},{status:400});
 try{const result=await submitRiskAnswer(session.user.id,side,Number(body?.stopLossPct),Number(body?.takeProfitPct));return NextResponse.json(result,{status:result.ok?200:result.status});}
 catch(error){console.error("risk lab answer:",error);return NextResponse.json({error:"Could not save the Risk Lab decision."},{status:503});}
}

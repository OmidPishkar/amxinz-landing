import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { answerPersonalMission } from "@/lib/personal-missions";
import { getEntitlement } from "@/lib/subscriptions";
export const dynamic="force-dynamic";
export async function POST(req:Request){
 const session=await getServerSession(authOptions);if(!session?.user?.id)return NextResponse.json({error:"Sign in to submit a Personal Mission answer."},{status:401});
 const entitlement=await getEntitlement(session.user.id);if(!["pro","elite"].includes(entitlement.planId))return NextResponse.json({error:"Personal Missions require a Pro or Elite plan."},{status:403});
 const body=await req.json().catch(()=>null);if(!Number.isInteger(body?.index)||!["up","down"].includes(body?.choice))return NextResponse.json({error:"Choose Up or Down for a valid scenario."},{status:400});
 try{const result=await answerPersonalMission(session.user.id,body.index,body.choice);return NextResponse.json(result,{status:result.ok?200:result.status});}
 catch(error){console.error("personal mission answer:",error);return NextResponse.json({error:"Could not save your answer."},{status:503});}
}

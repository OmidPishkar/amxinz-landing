import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRiskSession,getRiskHistory } from "@/lib/risk-lab";
import { awardXp } from "@/lib/progress";
export const dynamic="force-dynamic";
export async function GET(){
 const session=await getServerSession(authOptions);if(!session?.user?.id)return NextResponse.json({error:"Sign in to use Risk Lab."},{status:401});
 try{const scenario=await getRiskSession(session.user.id);if(scenario.status==="completed"){try{await awardXp(session.user.id,"risk:"+scenario.sessionId,5);}catch(error){console.error("risk lab XP recovery:",error);}}const history=await getRiskHistory(session.user.id);await Promise.all(history.map((item)=>awardXp(session.user.id,"risk:"+item.sessionId,5).catch((error)=>console.error("risk lab XP recovery:",error))));const entry=scenario.visible[scenario.visible.length-1]?.close??0;const result=scenario.answer?{...scenario.answer,entry,future:scenario.future,reveal:{symbol:scenario.symbol,interval:scenario.interval,startTime:scenario.startTime}}:null;return NextResponse.json({sessionId:scenario.sessionId,interval:scenario.interval,candles:scenario.visible,completed:scenario.status==="completed",result,history});}
 catch(error){console.error("risk lab GET:",error);return NextResponse.json({error:"Could not load a Risk Lab scenario."},{status:503});}
}

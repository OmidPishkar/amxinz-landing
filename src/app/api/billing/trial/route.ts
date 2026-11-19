import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startFreeTrial } from "@/lib/subscriptions";
export const dynamic="force-dynamic";
export async function POST(){
 const session=await getServerSession(authOptions);if(!session?.user?.id)return NextResponse.json({error:"Sign in to start your trial."},{status:401});
 try{const result=await startFreeTrial(session.user.id);if(!result.ok){const messages={email:"Verify your email address before starting the free trial.",active:"Your account already has an active subscription.",used:"The 14-day free trial has already been used on this account."};return NextResponse.json({error:messages[result.reason]},{status:result.reason==="email"?403:409});}return NextResponse.json({ok:true,currentPeriodEnd:result.currentPeriodEnd.toISOString()});}
 catch(error){console.error("start trial:",error);return NextResponse.json({error:"We could not start your trial. Please try again."},{status:500});}
}

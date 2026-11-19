import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDailyMissionState } from "@/lib/daily-mission";
export const dynamic="force-dynamic";
export async function GET(){const session=await getServerSession(authOptions);if(!session?.user?.id)return NextResponse.json({error:"Sign in to join the Daily Mission."},{status:401});try{return NextResponse.json(await getDailyMissionState(session.user.id));}catch(error){console.error("daily mission GET:",error);return NextResponse.json({error:"Could not load today's mission."},{status:503});}}

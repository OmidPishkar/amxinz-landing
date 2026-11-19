import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPersonalMissionState } from "@/lib/personal-missions";
import { getEntitlement } from "@/lib/subscriptions";
export const dynamic="force-dynamic";
export async function GET(){const session=await getServerSession(authOptions);if(!session?.user?.id)return NextResponse.json({error:"Sign in to use Personal Missions."},{status:401});try{const entitlement=await getEntitlement(session.user.id);if(!["pro","elite"].includes(entitlement.planId))return NextResponse.json({error:"Personal Missions require a Pro or Elite plan."},{status:403});return NextResponse.json(await getPersonalMissionState(session.user.id));}catch(error){console.error("personal mission GET:",error);return NextResponse.json({error:"Could not prepare a Personal Mission."},{status:503});}}

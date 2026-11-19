import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
export const dynamic="force-dynamic";
export async function PATCH(req:Request,{params}:{params:Promise<{code:string}>}){
 const session=await getServerSession(authOptions);if(!(await isAdminSession(session)))return NextResponse.json({error:"Forbidden."},{status:403});
 const {code:raw}=await params;const body=await req.json().catch(()=>null);if(typeof body?.enabled!=="boolean")return NextResponse.json({error:"An enabled boolean is required."},{status:400});
 const db=await getDb();const col=db.collection("discount_codes");const code=raw.toUpperCase();const before=await col.findOne({code});if(!before)return NextResponse.json({error:"Discount code not found."},{status:404});
 const now=new Date();await col.updateOne({code},{$set:{enabled:body.enabled,updatedAt:now,updatedBy:session?.user?.email??"admin"}});
 await db.collection("admin_audit_logs").insertOne({actor:session?.user?.email??session?.user?.id??"admin",at:now,action:body.enabled?"discount.enabled":"discount.disabled",targetType:"discount_code",targetId:code,before:{enabled:before.enabled},after:{enabled:body.enabled},reason:"Updated via admin discount manager"});
 return NextResponse.json({ok:true});
}

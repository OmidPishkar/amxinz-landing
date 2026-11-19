import { getDb } from "@/lib/mongodb";
import type { PlanId,TermId } from "@/lib/subscriptions";
export interface DiscountCodeDoc {code:string;percent:number;startsAt:Date;endsAt:Date;maxUses:number|null;uses:number;eligiblePlans:Exclude<PlanId,"free">[];eligibleTerms:TermId[];enabled:boolean;createdAt:Date;createdBy:string}
export async function validateDiscountCode(rawCode:string,plan:Exclude<PlanId,"free">,term:TermId,now=new Date()){
 const code=rawCode.trim().toUpperCase();if(!/^[A-Z0-9-]{3,24}$/.test(code))throw new Error("Enter a valid discount code.");
 const doc=await(await getDb()).collection<DiscountCodeDoc>("discount_codes").findOne({code});
 if(!doc||!doc.enabled||now<new Date(doc.startsAt)||now>new Date(doc.endsAt))throw new Error("This discount code is invalid or expired.");
 if(!doc.eligiblePlans.includes(plan)||!doc.eligibleTerms.includes(term))throw new Error("This code is not valid for the selected plan or billing term.");
 if(doc.maxUses!==null&&doc.maxUses!==undefined&&doc.uses>=doc.maxUses)throw new Error("This discount code has reached its usage limit.");
 return doc;
}
export async function redeemDiscountCode(invoiceId:string,code:string){
 const db=await getDb();const redemptions=db.collection("discount_redemptions");await redemptions.createIndex({invoiceId:1},{unique:true});
 try{await redemptions.insertOne({invoiceId,code,redeemedAt:new Date()});}catch(error){if((error as {code?:number})?.code===11000)return true;throw error;}
 const result=await db.collection<DiscountCodeDoc>("discount_codes").updateOne({code,$or:[{maxUses:null},{maxUses:{$exists:false}},{$expr:{$lt:["$uses","$maxUses"]}}]},{$inc:{uses:1}});
 if(!result.modifiedCount){await redemptions.deleteOne({invoiceId});return false;}return true;
}

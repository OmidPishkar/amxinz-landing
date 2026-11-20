import { getDb } from "@/lib/mongodb";
import type { PlanId,TermId } from "@/lib/subscriptions";
export interface DiscountCodeDoc {code:string;percent:number;startsAt:Date;endsAt:Date;maxUses:number|null;uses:number;eligiblePlans:Exclude<PlanId,"free">[];eligibleTerms:TermId[];enabled:boolean;createdAt:Date;createdBy:string;redeemedInvoiceIds?:string[]}
export async function validateDiscountCode(rawCode:string,plan:Exclude<PlanId,"free">,term:TermId,now=new Date()){
 const code=rawCode.trim().toUpperCase();if(!/^[A-Z0-9-]{3,24}$/.test(code))throw new Error("Enter a valid discount code.");
 const doc=await(await getDb()).collection<DiscountCodeDoc>("discount_codes").findOne({code});
 if(!doc||!doc.enabled||now<new Date(doc.startsAt)||now>new Date(doc.endsAt))throw new Error("This discount code is invalid or expired.");
 if(!doc.eligiblePlans.includes(plan)||!doc.eligibleTerms.includes(term))throw new Error("This code is not valid for the selected plan or billing term.");
 if(doc.maxUses!==null&&doc.maxUses!==undefined&&doc.uses>=doc.maxUses)throw new Error("This discount code has reached its usage limit.");
 return doc;
}
export async function redeemDiscountCode(invoiceId:string,code:string){
 const db=await getDb();
 const redemptions=db.collection("discount_redemptions");
 await redemptions.createIndex({invoiceId:1},{unique:true});
 // Preserve idempotency for redemptions written by the previous implementation.
 if(await redemptions.findOne({invoiceId}))return true;
 const codes=db.collection<DiscountCodeDoc>("discount_codes");
 // The usage increment and invoice claim happen in one atomic document update.
 // Concurrent verifications cannot consume the same invoice twice or exceed maxUses.
 const result=await codes.updateOne(
  {code,redeemedInvoiceIds:{$ne:invoiceId},$or:[{maxUses:null},{maxUses:{$exists:false}},{$expr:{$lt:["$uses","$maxUses"]}}]},
  {$inc:{uses:1},$addToSet:{redeemedInvoiceIds:invoiceId}},
 );
 if(result.modifiedCount===1){
  await redemptions.updateOne({invoiceId},{$setOnInsert:{invoiceId,code,redeemedAt:new Date()}},{upsert:true});
  return true;
 }
 // A parallel request may have claimed the same invoice while this request waited.
 if(await codes.findOne({code,redeemedInvoiceIds:invoiceId}))return true;
 return false;
}

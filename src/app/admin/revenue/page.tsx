import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
import { AdminToolsNav } from "@/components/admin/admin-tools-nav";
import { InvoiceReview } from "@/components/admin/invoice-review";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Revenue & Payments · Admin",robots:{index:false,follow:false}};
export default async function AdminRevenuePage(){
 const session=await getServerSession(authOptions);if(!(await isAdminSession(session)))notFound();const db=await getDb();
 const [totals,invoices]=await Promise.all([db.collection("invoices").aggregate([{$match:{status:"paid"}},{$group:{_id:null,count:{$sum:1},revenueUsd:{$sum:"$amountUsd"},grossUsd:{$sum:"$originalAmountUsd"},discountUsd:{$sum:"$discountAmountUsd"}}}]).toArray(),db.collection("invoices").find({}).sort({createdAt:-1}).limit(100).toArray()]);
 const summary=totals[0]??{count:0,revenueUsd:0,grossUsd:0,discountUsd:0};
 return <div className="mx-auto max-w-6xl px-4 py-10"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">Revenue & Payments</h1><p className="mt-1 text-sm text-muted-foreground">Revenue totals include verified PAID invoices only.</p></div><Link href="/admin" className="text-sm underline">Admin overview</Link></div><AdminToolsNav/><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Gross paid",summary.grossUsd],["Discounts",summary.discountUsd],["Net revenue",summary.revenueUsd],["Paid invoices",summary.count]].map(([label,value])=><div key={label} className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{label==="Paid invoices"?value:"$"+Number(value??0).toFixed(2)}</p></div>)}</div><div className="mt-6 overflow-x-auto rounded-xl border"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="bg-muted"><tr>{["Invoice","User","Plan","Term","Gross","Discount","Net paid","Status","Transaction","Created","Manual review"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{invoices.map(i=><tr key={String(i.invoiceId)} className="border-t"><td className="p-3 font-mono text-xs">{String(i.invoiceId).slice(0,8)}</td><td className="p-3 font-mono text-xs">{i.userId}</td><td className="p-3 capitalize">{i.planId}</td><td className="p-3">{i.term}</td><td className="p-3">${Number(i.originalAmountUsd??i.amountUsd).toFixed(2)}</td><td className="p-3">${Number(i.discountAmountUsd??0).toFixed(2)} {i.discountCode?"("+i.discountCode+")":""}</td><td className="p-3">${Number(i.amountUsd).toFixed(2)}</td><td className="p-3 capitalize">{i.status}</td><td className="max-w-[180px] truncate p-3 font-mono text-xs">{i.txHash??"—"}</td><td className="p-3">{new Date(i.createdAt).toLocaleString("en-GB")}</td><td className="p-3"><InvoiceReview invoiceId={String(i.invoiceId)} status={String(i.status)}/></td></tr>)}</tbody></table></div></div>;
}

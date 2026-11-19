import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { AdminToolsNav } from "@/components/admin/admin-tools-nav";
import { DiscountManager } from "@/components/admin/discount-manager";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Discount Codes · Admin",robots:{index:false,follow:false}};
export default async function AdminDiscountsPage(){const session=await getServerSession(authOptions);if(!(await isAdminSession(session)))notFound();return <div className="mx-auto max-w-6xl px-4 py-10"><h1 className="text-2xl font-semibold">Discount Codes</h1><p className="mt-1 text-sm text-muted-foreground">Create percentage discounts with time windows, usage limits and eligible plans or terms.</p><AdminToolsNav/><div className="mt-6"><DiscountManager/></div></div>}

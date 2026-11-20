import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserStats } from "@/lib/users";
import { getEntitlement } from "@/lib/subscriptions";
import { Landing } from "@/components/landing/landing";
import { Game } from "@/components/game/game";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/config/site";
export const dynamic="force-dynamic";
export const metadata=pageMetadata({description:SITE.description,path:"/"});
export default async function Home(){
 const session=await getServerSession(authOptions);
 if(!session?.user?.id)return <Landing showAds/>;
 const [stats,entitlement]=await Promise.all([getUserStats(session.user.id),getEntitlement(session.user.id)]);
 return <Game initialStats={stats} showAds={!entitlement.isAdFree && !entitlement.adsSuppressedOnError}/>;
}
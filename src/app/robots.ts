import type { MetadataRoute } from "next";
import { SITE,SITE_URL } from "@/config/site";
const AI_TRAINING_BOTS=["GPTBot","CCBot","Google-Extended","ClaudeBot","anthropic-ai","Bytespider"];
export default function robots():MetadataRoute.Robots{
 const isProduction=!process.env.CONTEXT||process.env.CONTEXT==="production";
 if(!isProduction)return{rules:[{userAgent:"*",disallow:"/"}]};
 return{rules:[{userAgent:"*",allow:["/","/pricing","/documents","/privacy","/faq","/about","/weblog","/leaderboard","/challenges","/u/"],disallow:["/api/","/admin","/profile","/checkout","/referrals","/risk-lab","/skills","/reports","/analytics","/daily-mission","/personal-missions","/challenges/*/play","/weblog/new","/weblog/*/edit"]},...(SITE.blockAiTraining?[{userAgent:AI_TRAINING_BOTS,disallow:["/"]}]:[])],sitemap:SITE_URL+"/sitemap.xml",host:SITE_URL};
}
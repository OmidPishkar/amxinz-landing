import type { MetadataRoute } from "next";
import { SITE,SITE_URL } from "@/config/site";
import { listPostsForSitemap,listAllTags } from "@/lib/blog";
import { listPublicUsernames } from "@/lib/users";
export const dynamic="force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const [blog,profiles]=await Promise.all([
  (async()=>{try{const [posts,tags]=await Promise.all([listPostsForSitemap(),listAllTags()]);return{posts,tags};}catch(error){console.error("sitemap blog:",error);return{posts:[],tags:[]};}})(),
  (async()=>{try{return await listPublicUsernames();}catch(error){console.error("sitemap profiles:",error);return[];}})()
 ]);
 const paths=["/","/pricing","/documents","/privacy","/faq","/about","/leaderboard","/challenges","/weblog"];
 const staticEntries:MetadataRoute.Sitemap=paths.map(path=>({url:SITE_URL+path,lastModified:path==="/" ? new Date(SITE.landingUpdated):new Date(),changeFrequency:path==="/leaderboard"||path==="/challenges"?"hourly":"weekly",priority:path==="/"?1:path==="/weblog"?0.9:0.7}));
 const postEntries:MetadataRoute.Sitemap=blog.posts.map(post=>({url:SITE_URL+"/weblog/"+post.slug,lastModified:post.updatedAt,changeFrequency:"monthly",priority:0.7}));
 const tagEntries:MetadataRoute.Sitemap=blog.tags.map(tag=>({url:SITE_URL+"/weblog/tag/"+tag.slug,changeFrequency:"weekly",priority:0.4}));
 const profileEntries:MetadataRoute.Sitemap=profiles.filter(user=>!!user.username).map(user=>({url:SITE_URL+"/u/"+user.username,lastModified:user.createdAt,changeFrequency:"monthly",priority:0.4}));
 return [...staticEntries,...postEntries,...tagEntries,...profileEntries];
}
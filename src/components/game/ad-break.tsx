"use client";
import { useEffect,useState } from "react";
import { Button } from "@/components/ui/button";
import { AdFrame } from "@/components/ad-frame";
import { HAS_IFRAME_AD } from "@/lib/ads";
import { AD_SKIP_SECONDS } from "@/lib/game";
export function AdBreak({onClose}:{onClose:()=>void}){
 const [secondsLeft,setSecondsLeft]=useState(AD_SKIP_SECONDS);
 useEffect(()=>{const interval=setInterval(()=>setSecondsLeft(value=>Math.max(0,value-1)),1000);return()=>clearInterval(interval);},[]);
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=previous;};},[]);
 if(!HAS_IFRAME_AD)return null;
 return <div role="dialog" aria-modal="true" aria-label="Advertisement" className="fixed inset-0 z-[60] flex flex-col bg-background"><div className="flex h-12 shrink-0 items-center justify-between border-b px-4"><span className="text-xs uppercase tracking-wide text-muted-foreground">Advertisement</span><Button size="sm" variant={secondsLeft===0?"default":"outline"} disabled={secondsLeft>0} onClick={onClose}>{secondsLeft>0?"Continue in "+secondsLeft+"s":"Continue"}</Button></div><div className="grid flex-1 place-items-center overflow-auto p-4"><AdFrame/></div><p className="shrink-0 border-t px-4 py-2 text-center text-xs text-muted-foreground">A-ADS helps keep Amxinz free to use.</p></div>;
}
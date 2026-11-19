// A-ADS is the only advertising provider used by Amxinz.
export type AdProvider="iframe"|"none";
export const ADS_ENABLED=process.env.NEXT_PUBLIC_ADS_ENABLED==="true";
function normalizeUrl(raw:string|undefined){const value=(raw??"").trim();if(value.startsWith("//"))return "https:"+value;return value.startsWith("https://")?value:"";}
export const AD_IFRAME_URL=normalizeUrl(process.env.NEXT_PUBLIC_AD_IFRAME_URL);
export const AD_IFRAME_WIDTH=Number(process.env.NEXT_PUBLIC_AD_IFRAME_WIDTH)||300;
export const AD_IFRAME_HEIGHT=Number(process.env.NEXT_PUBLIC_AD_IFRAME_HEIGHT)||250;
export const AD_PROVIDER:AdProvider=ADS_ENABLED&&AD_IFRAME_URL?"iframe":"none";
export const HAS_IFRAME_AD=AD_PROVIDER==="iframe";

import { normalizeFirstLandingPage } from '../intake/landing-page.ts';
export const ATTRIBUTION_KEY='a5.attribution.v1';
export const CAMPAIGN_KEYS=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','msclkid'] as const;
export type Touch={path:string|null;referrerHost:string|null;capturedAt:string;campaign:Partial<Record<typeof CAMPAIGN_KEYS[number],string>>};
export type Attribution={first:Touch;last:Touch};
export function normalizeTouch(raw:unknown):Touch|null {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Record<string,unknown>;const campaign:Touch['campaign']={};
 if(r.campaign&&typeof r.campaign==='object') for(const key of CAMPAIGN_KEYS){const v=(r.campaign as Record<string,unknown>)[key];if(typeof v==='string'&&/^[a-zA-Z0-9_.~+ -]{1,150}$/.test(v))campaign[key]=v;}
 const date=typeof r.capturedAt==='string'?Date.parse(r.capturedAt):NaN;
 if(!Number.isFinite(date)||date>Date.now()+300000||date<Date.now()-90*86400000)return null;
 return {path:normalizeFirstLandingPage(r.path),referrerHost:typeof r.referrerHost==='string'&&/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/.test(r.referrerHost)&&r.referrerHost.length<200?r.referrerHost:null,capturedAt:new Date(date).toISOString(),campaign};
}
export function normalizeAttribution(raw:unknown):Attribution|null {
 if(!raw||typeof raw!=='object')return null;
 const r=raw as Record<string,unknown>;const first=normalizeTouch(r.first),last=normalizeTouch(r.last);
 return first&&last?{first,last}:null;
}
export function nextAttribution(stored:unknown,touch:Touch):Attribution {
 const old=normalizeAttribution(stored);
 // Internal navigation is not a new acquisition touch. Preserve the original campaign.
 const newAcquisition=Object.keys(touch.campaign).length>0||Boolean(touch.referrerHost);
 return {first:old?.first??touch,last:old&&!newAcquisition?old.last:touch};
}
export function rememberAttribution(href:string,referrer:string) {
 try{const u=new URL(href);if(/^\/(admin|api|check-in|opportunity)(\/|$)/.test(u.pathname))return;
 const campaign:Touch['campaign']={};for(const k of CAMPAIGN_KEYS){const v=u.searchParams.get(k);if(v)campaign[k]=v;}
 let referrerHost:string|null=null;try{const ref=new URL(referrer);if(ref.hostname!==u.hostname)referrerHost=ref.hostname;}catch{}
 const touch=normalizeTouch({path:u.pathname,referrerHost,capturedAt:new Date().toISOString(),campaign});if(!touch)return;
 let old:unknown=null;try{old=JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY)??'null');}catch{}
 sessionStorage.setItem(ATTRIBUTION_KEY,JSON.stringify(nextAttribution(old,touch)));
 }catch{/* Attribution must never prevent a request. */}
}
export function readAttribution():Attribution|null {try{return normalizeAttribution(JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY)??'null'));}catch{return null;}}

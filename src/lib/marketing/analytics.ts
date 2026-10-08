export const ANALYTICS_EVENTS=['request_started','request_step_completed','request_validation_error','request_submitted','request_failed','call_clicked'] as const;
export type AnalyticsEvent=typeof ANALYTICS_EVENTS[number];
declare global {interface Window {dataLayer?:unknown[];gtag?:(...args:unknown[])=>void;}}
export const ANALYTICS_READY_EVENT='a5:analytics-ready';
export function trackEvent(name:AnalyticsEvent,step?:'project'|'details'|'contact'):boolean {
 if(typeof window==='undefined'||!window.gtag||/^\/(admin|opportunity|check-in)(\/|$)/.test(location.pathname))return false;
 try{if(localStorage.getItem('a5.analytics')!=='accepted')return false;}catch{return false;}
 window.gtag('event',name,{...(step?{step}:{}),transport_type:'beacon',page_location:location.origin+location.pathname,page_referrer:''});
 return true;
}

/** Retry only the intake-start event when consent initializes; never replay earlier activity. */
export function observeRequestStart(target:Pick<Window,'addEventListener'|'removeEventListener'>,emit:()=>boolean){
 let sent=false;
 const attempt=()=>{if(!sent)sent=emit();};
 target.addEventListener(ANALYTICS_READY_EVENT,attempt);
 attempt();
 return()=>target.removeEventListener(ANALYTICS_READY_EVENT,attempt);
}

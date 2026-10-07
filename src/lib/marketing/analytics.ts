export const ANALYTICS_EVENTS=['request_started','request_step_completed','request_validation_error','request_submitted','request_failed','call_clicked'] as const;
export type AnalyticsEvent=typeof ANALYTICS_EVENTS[number];
declare global {interface Window {dataLayer?:unknown[];gtag?:(...args:unknown[])=>void;}}
export function trackEvent(name:AnalyticsEvent,step?:'project'|'details'|'contact') {
 if(typeof window==='undefined'||!window.gtag)return;
 try{if(localStorage.getItem('a5.analytics')!=='accepted')return;}catch{return;}
 window.gtag('event',name,{...(step?{step}:{}),transport_type:'beacon',page_location:location.origin+location.pathname,page_referrer:''});
}

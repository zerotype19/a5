import {normalizeFirstLandingPage} from '../intake/landing-page.ts';
import type {LeadStatus} from '../db/schema.ts';
export type AcquisitionEvidence={path?:unknown;referrerHost?:string|null;campaign?:{utm_source?:string;utm_medium?:string;gclid?:string;msclkid?:string}};
export function acquisitionChannel(touch:AcquisitionEvidence|null|undefined):string {
 const c=touch?.campaign??{}; const medium=c.utm_medium?.toLowerCase();
 if(c.gclid||c.msclkid||['cpc','ppc','paid','paidsearch','paid_search','display','paid_social'].includes(medium??''))return 'Paid / tagged advertising';
 if(medium==='organic')return 'Organic search (reported)';
 if(medium||c.utm_source)return 'Other campaign';
 const host=touch?.referrerHost?.toLowerCase()??'';
 // Exact search hosts: a misleading suffix or an arbitrary Google product is not search.
 if(/^(www\.)?(google\.(com|co\.uk|ca|com\.au)|bing\.com|duckduckgo\.com|search\.yahoo\.com|search\.brave\.com|ecosia\.org)$/.test(host))return 'Organic search (inferred)';
 return host?'Referral':'Direct / unknown';
}
export type AcquisitionLead={id:string;status:LeadStatus;service_id:string|null;location_id:string|null;first_landing_page?:string|null;lead_acquisition:{first_touch:AcquisitionEvidence|null}[]|{first_touch:AcquisitionEvidence|null}|null};
export function buildAcquisitionReport(leads:AcquisitionLead[]){
 const groups=new Map<string,{channel:string;path:string;service:string;town:string;requests:number;reviewed:number;excluded:number;won:number}>();
 for(const lead of leads){const acq=Array.isArray(lead.lead_acquisition)?lead.lead_acquisition[0]:lead.lead_acquisition;
 const touch=acq?.first_touch;const channel=acquisitionChannel(touch),path=normalizeFirstLandingPage(touch?.path)??normalizeFirstLandingPage(lead.first_landing_page)??'Unknown landing page';
 const service=lead.service_id??'Not specified',town=lead.location_id??'Not specified';const key=JSON.stringify([channel,path,service,town]);
 const g=groups.get(key)??{channel,path,service,town,requests:0,reviewed:0,excluded:0,won:0};g.requests++;
 if(['QUALIFIED','ASSIGNED','ACCEPTED','CONTACTED','ESTIMATE','WON','LOST'].includes(lead.status))g.reviewed++;
 if(['INVALID','DUPLICATE','UNSERVICEABLE'].includes(lead.status))g.excluded++;
 if(lead.status==='WON')g.won++;groups.set(key,g);}
 return [...groups.values()].sort((a,b)=>b.requests-a.requests||a.path.localeCompare(b.path));
}

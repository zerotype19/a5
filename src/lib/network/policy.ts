export const NETWORK_CONSENT_VERSION='2026-10-08';
export const NETWORK_DISCLOSURE='A5 is a home services network, not the contractor doing the work. By sending this request, you ask A5 to share it with a relevant independent service professional. The full request and contact details are released after that professional accepts the opportunity. You arrange scope, price and scheduling directly. If an offer is declined or expires, A5 may offer the request to another professional; after acceptance, we will confirm with you before making another introduction. A5 may email you about your request and ask whether the connection was successful. This is not permission for marketing or automated promotional calls or texts.';
export function acceptanceHours(raw=process.env.A5_ACCEPTANCE_HOURS):number{const n=Number(raw);return Number.isInteger(n)&&n>=1&&n<=72?n:24;}
export const CONTACT_CHOICES=['YES','NO','UNKNOWN'] as const;
export const OUTCOME_CHOICES=['DISCUSSING','ESTIMATE','SCHEDULED','COMPLETED','DID_NOT_PROCEED','PENDING'] as const;
export type NetworkReport={id:string;assignment_id:string;party:'HOMEOWNER'|'VENDOR';contact:string;outcome:string;rating:number|null;note:string;help_requested:boolean;created_at:string;disputed:boolean;excluded:boolean};
export function validateReport(input:Record<string,unknown>,party:'HOMEOWNER'|'VENDOR',accepted:boolean){
 const contact=String(input.contact??''),outcome=String(input.outcome??''),note=String(input.note??'').trim();
 const rating=input.rating===''||input.rating==null?null:Number(input.rating);
 if(!(CONTACT_CHOICES as readonly string[]).includes(contact)||!(OUTCOME_CHOICES as readonly string[]).includes(outcome)||note.length>2000)return{ok:false as const,error:'Choose a contact answer and project outcome. Notes must be 2,000 characters or fewer.'};
 if(contact!=='YES'&&['ESTIMATE','SCHEDULED','COMPLETED'].includes(outcome))return{ok:false as const,error:'Contact must be confirmed before reporting an estimate, scheduled work or completion.'};
 if(outcome==='COMPLETED'&&!accepted)return{ok:false as const,error:'Completion can only be reported for an accepted introduction.'};
 if(rating!==null&&(party!=='HOMEOWNER'||!accepted||contact!=='YES'||outcome!=='COMPLETED'||!Number.isInteger(rating)||rating<1||rating>5))return{ok:false as const,error:'Workmanship ratings are only for work you report completed by this accepted provider.'};
 return{ok:true as const,contact,outcome,rating,note,helpRequested:party==='HOMEOWNER'&&input.helpRequested===true};
}
export function latestReports(rows:NetworkReport[]):NetworkReport[]{const seen=new Set<string>();return [...rows].sort((a,b)=>b.created_at.localeCompare(a.created_at)||b.id.localeCompare(a.id)).filter(r=>{const key=`${r.assignment_id}:${r.party}`;if(seen.has(key))return false;seen.add(key);return true;});}
export function connectionState(reports:NetworkReport[],accepted:boolean){
 const latest=latestReports(reports).filter(r=>!r.excluded),home=latest.find(r=>r.party==='HOMEOWNER'),vendor=latest.find(r=>r.party==='VENDOR');
 const conflict=!!(home&&vendor&&((home.contact==='YES'&&vendor.contact==='NO')||(home.contact==='NO'&&vendor.contact==='YES')||(home.outcome==='COMPLETED'&&vendor.outcome==='DID_NOT_PROCEED')||(vendor.outcome==='COMPLETED'&&home.outcome==='DID_NOT_PROCEED')));
 if(conflict||latest.some(r=>r.disputed))return 'Reports need review';
 if(home?.help_requested||home?.contact==='NO'||home?.outcome==='DID_NOT_PROCEED')return 'Connection needs follow-up';
 if(home?.outcome==='COMPLETED')return 'Homeowner reports completed';
 if(home?.contact==='YES')return 'Homeowner confirms contact';
 return accepted?'Contact pending / unknown':'Awaiting acceptance';
}

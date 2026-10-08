import {publicReferenceFromLeadId} from './format.ts';
import type {LeadStatus} from '../db/schema.ts';
export type QueueLead={id:string;status:LeadStatus;created_at:string;follow_up_at?:string|null};
export type QueueAssignment={id:string;lead_id:string;status:string;assigned_at:string;notification_status:string|null;notification_sent_at:string|null};
export type QueueCapability={assignment_id:string;expires_at:string;revoked_at:string|null};
export type WorkItem={id:string;kind:'request'|'vendor';title:string;action:string;detail:string;href:string;priority:number;since:string};
const terminal=new Set(['WON','LOST','INVALID','DUPLICATE','UNSERVICEABLE']);
export function buildLeadWorkQueue(leads:QueueLead[],assignments:QueueAssignment[],capabilities:QueueCapability[],now:string):WorkItem[]{
 return leads.filter(l=>!terminal.has(l.status)).map(l=>{
  const base={id:l.id,kind:'request' as const,title:publicReferenceFromLeadId(l.id),href:`/admin/leads/${l.id}`,since:l.created_at};
  const due=l.follow_up_at&&Date.parse(l.follow_up_at)<=Date.parse(now);
  if(l.status==='NEW')return{...base,action:'Review request',detail:'Review the project, service and location.',priority:2};
  if(l.status==='QUALIFIED')return{...base,action:'Assign a vendor',detail:'Choose a provider and confirm the project fit.',priority:2};
  if(l.status==='ASSIGNED'){
   const current=assignments.filter(a=>a.lead_id===l.id&&a.status==='ASSIGNED').sort((a,b)=>b.assigned_at.localeCompare(a.assigned_at))[0];
   if(!current)return{...base,action:'Review assignment',detail:'No open assignment was found for this assigned request.',priority:0};
   if(current.notification_status==='FAILED')return{...base,action:'Resolve delivery failure',detail:'The assignment email failed. Review the recipient and retry from the lead.',priority:0};
   if(current.notification_status!=='SENT')return{...base,action:'Check assignment delivery',detail:current.notification_status==='PENDING'?'Email delivery is pending; inspect the latest attempt before retrying.':'No sent assignment email is recorded.',priority:1};
   const valid=capabilities.some(c=>c.assignment_id===current.id&&!c.revoked_at&&Date.parse(c.expires_at)>Date.parse(now));
   if(!valid)return{...base,action:'Renew vendor handoff',detail:'No unexpired response link remains. Review and resend or reassign.',priority:1};
   return{...base,action:due?'Follow up with vendor':'Awaiting vendor response',detail:due?'The scheduled follow-up is due.':'Assignment email sent; acceptance is not yet recorded.',priority:due?1:5,since:l.follow_up_at??current.assigned_at};
  }
  if(due)return{...base,action:'Follow up on project',detail:'The scheduled follow-up is due. Record progress or choose the next follow-up date.',priority:1,since:l.follow_up_at!};
  if(l.follow_up_at)return{...base,action:'Scheduled follow-up',detail:'A future follow-up is recorded; open the request for details.',priority:6,since:l.follow_up_at};
  return{...base,action:l.status==='ACCEPTED'?'Confirm homeowner contact':l.status==='CONTACTED'?'Check estimate progress':'Record project outcome',detail:'Record the next step and set a follow-up date.',priority:3};
 }).sort((a,b)=>a.priority-b.priority||a.since.localeCompare(b.since)||a.id.localeCompare(b.id));
}
export function buildVendorWorkQueue(vendors:{id:string;businessName:string;status:string;email:string|null;phone:string|null;discoveryNotes?:string|null}[]):WorkItem[]{return vendors.filter(v=>v.status==='DISCOVERED'||v.status==='APPROVED'||v.status==='ACTIVE'&&(!v.email||!!v.discoveryNotes?.includes('Contact confirmation pending.'))).map(v=>({id:`vendor-${v.id}`,kind:'vendor' as const,title:v.businessName,action:!v.email?'Find and confirm email':v.discoveryNotes?.includes('Contact confirmation pending.')?'Confirm vendor email':'Confirm vendor readiness',detail:!v.email?'The email Accept/Pass flow needs a confirmed recipient.': v.discoveryNotes?.includes('Contact confirmation pending.')?'Confirm the public-source recipient, then replace the pending contact note with dated confirmation.':'Confirm work, territory, capacity and the intended recipient before sending a customer request.',href:`/admin/vendors/${v.id}`,priority:4,since:''})).sort((a,b)=>a.title.localeCompare(b.title));}

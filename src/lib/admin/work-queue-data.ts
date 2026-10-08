import {loadNetworkData} from '../network/data.ts';
import {networkQueue} from '../network/queue.ts';
import {loadVendorSignups} from '../vendor-signup/admin.ts';
import {getSupabaseAdmin} from '../supabase/admin.ts';
import {readAllRows} from './read-all.ts';
import {loadVendors} from './vendors.ts';
import {buildLeadWorkQueue,buildVendorWorkQueue,type QueueLead,type QueueAssignment,type QueueCapability} from './work-queue.ts';
/** Protected layout authorizes all callers. Never imported by public pages. */
export async function loadWorkQueue(){
 const db=getSupabaseAdmin();
 const fields=process.env.ENABLE_LEAD_OUTCOMES==='true'?'id,status,created_at,follow_up_at':'id,status,created_at';
 const leads=await readAllRows((from,to)=>db.from('leads').select(fields).in('status',['NEW','QUALIFIED','ASSIGNED','ACCEPTED','CONTACTED','ESTIMATE']).order('id').range(from,to),'admin_queue_leads') as unknown as QueueLead[];
 const assignments=await readAllRows((from,to)=>db.from('lead_assignments').select('id,lead_id,status,assigned_at,notification_status,notification_sent_at').eq('status','ASSIGNED').order('id').range(from,to),'admin_queue_assignments') as QueueAssignment[];
 const capabilities=await readAllRows((from,to)=>db.from('assignment_capabilities').select('assignment_id,expires_at,revoked_at').is('revoked_at',null).order('id').range(from,to),'admin_queue_capabilities') as QueueCapability[];
 const vendors=await loadVendors();
 const signups=await loadVendorSignups(true);
 const network=await loadNetworkData();
 const now=new Date().toISOString();
 const tasks=networkQueue(network.assignments.map(a=>({...a,acceptance_due_at:a.acceptance_due_at??capabilities.find(c=>c.assignment_id===a.id)?.expires_at??null})),network.reports,network.invitations,now).filter(task=>task.priority<3||!leads.find(l=>l.id===task.id)?.follow_up_at||Date.parse(leads.find(l=>l.id===task.id)!.follow_up_at!)<=Date.parse(now));
 const requestTasks=buildLeadWorkQueue(leads,assignments,capabilities,new Date().toISOString());
 const requests=[...requestTasks.filter(r=>!tasks.some(t=>t.id===r.id)),...tasks.filter(t=>leads.some(l=>l.id===t.id))].sort((a,b)=>a.priority-b.priority||a.since.localeCompare(b.since));
 return{requests,vendors:[...signups.map(s=>({id:`signup-${s.id}`,kind:'vendor' as const,title:s.payload.businessName,action:'Review vendor signup',detail:`${s.payload.serviceIds.length} services · ${s.payload.locationIds.length} towns. Create or link a vendor record.`,href:`/admin/vendors/signups/${s.id}`,priority:2,since:s.created_at})),...buildVendorWorkQueue(vendors)]};
}

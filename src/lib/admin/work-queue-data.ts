import {loadNetworkData} from '../network/data.ts';
import {networkQueue} from '../network/queue.ts';
import {loadVendorSignups} from '../vendor-signup/admin.ts';
import {getSupabaseAdmin} from '../supabase/admin.ts';
import {readAllRows} from './read-all.ts';
import {loadVendorProgress,PROGRESS_LABELS} from '../opportunity/progress.ts';
import {buildLeadWorkQueue,buildVendorWorkQueue,type QueueLead,type QueueAssignment,type QueueCapability} from './work-queue.ts';
/** Protected layout authorizes all callers. Never imported by public pages. */
export async function loadWorkQueue(){
 const db=getSupabaseAdmin();
 const fields=process.env.ENABLE_LEAD_OUTCOMES==='true'?'id,status,created_at,updated_at,follow_up_at':'id,status,created_at,updated_at';
 const [leads,assignments,capabilities,vendorRows,signups,network,progress,failedEmails]=await Promise.all([
  readAllRows((from,to)=>db.from('leads').select(fields).is('archived_at',null).in('status',['NEW','QUALIFIED','ASSIGNED','ACCEPTED','CONTACTED','ESTIMATE']).order('id').range(from,to),'admin_queue_leads') as unknown as Promise<QueueLead[]>,
  readAllRows((from,to)=>db.from('lead_assignments').select('id,lead_id,status,assigned_at,notification_status,notification_sent_at').eq('status','ASSIGNED').order('id').range(from,to),'admin_queue_assignments') as Promise<QueueAssignment[]>,
  readAllRows((from,to)=>db.from('assignment_capabilities').select('assignment_id,expires_at,revoked_at').is('revoked_at',null).order('id').range(from,to),'admin_queue_capabilities') as Promise<QueueCapability[]>,
  readAllRows((from,to)=>db.from('vendors').select('id,business_name,status,email,phone').is('archived_at',null).order('id').range(from,to),'queue_vendors'),
  loadVendorSignups(true),loadNetworkData(),loadVendorProgress(),
  readAllRows((from,to)=>db.from('lead_notification_outbox').select('id,lead_id,kind,created_at').eq('status','FAILED').order('id').range(from,to),'failed_request_emails')
 ]);
 const vendors=vendorRows.map(v=>({id:v.id as string,businessName:v.business_name as string,status:v.status as string,email:v.email as string|null,phone:v.phone as string|null}));
 const now=new Date().toISOString();
 const tasks=networkQueue(network.assignments.map(a=>({...a,acceptance_due_at:a.acceptance_due_at??capabilities.find(c=>c.assignment_id===a.id)?.expires_at??null})),network.reports,network.invitations,now).filter(task=>task.priority<3||!leads.find(l=>l.id===task.id)?.follow_up_at||Date.parse(leads.find(l=>l.id===task.id)!.follow_up_at!)<=Date.parse(now));
 const requestTasks=buildLeadWorkQueue(leads,assignments,capabilities,new Date().toISOString());
 const progressByLead=new Map<string,typeof progress[number]>();
 for(const report of progress){const id=report.lead_assignments?.lead_id;if(id&&!progressByLead.has(id))progressByLead.set(id,report);}
 const requests=[...requestTasks.filter(r=>!tasks.some(t=>t.id===r.id)),...tasks.filter(t=>leads.some(l=>l.id===t.id))].map(task=>{const failure=failedEmails.find(e=>e.lead_id===task.id);if(failure)return {...task,action:'Review request email delivery',detail:`${failure.kind==='homeowner_receipt'?'Homeowner confirmation':'Operator alert'} failed. Open the request to inspect email status.`,priority:0};const report=progressByLead.get(task.id);if(!report)return task;return {...task,action:['DISQUALIFIED','UNREACHABLE'].includes(report.status)?'Review vendor update':task.action,detail:`Vendor reports: ${PROGRESS_LABELS[report.status]}. ${report.note}`,priority:['DISQUALIFIED','UNREACHABLE'].includes(report.status)?0:task.priority,since:report.created_at>task.since?report.created_at:task.since};}).sort((a,b)=>a.priority-b.priority||b.since.localeCompare(a.since));
 return{requests,vendors:[...signups.map(s=>({id:`signup-${s.id}`,kind:'vendor' as const,title:s.payload.businessName,action:'Review vendor signup',detail:`${s.payload.serviceIds.length} services · ${s.payload.locationIds.length} towns. Create or link a vendor record.`,href:`/admin/vendors/signups/${s.id}`,priority:2,since:s.created_at})),...buildVendorWorkQueue(vendors)]};
}

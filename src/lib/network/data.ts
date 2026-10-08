import {getSupabaseAdmin} from '../supabase/admin.ts';
import {readAllRows} from '../admin/read-all.ts';
import {requireAdminAccess} from '../admin/authorize.ts';
import type {NetworkReport} from './policy.ts';
import type {NetworkAssignment} from './evidence.ts';
export type NetworkInvitation={id:string;assignment_id:string;party:'HOMEOWNER'|'VENDOR';status:string;created_at:string;sent_at:string|null;expires_at:string;revoked_at:string|null;error_code:string|null};
export async function loadNetworkData(leadId?:string){
 if(process.env.ENABLE_NETWORK_FOLLOWUP!=='true')return{assignments:[] as NetworkAssignment[],reports:[] as NetworkReport[],invitations:[] as NetworkInvitation[]};
 await requireAdminAccess();const db=getSupabaseAdmin();
 const assignments=await readAllRows((from,to)=>{let q=db.from('lead_assignments').select('id,lead_id,vendor_id,status,assigned_at,accepted_at,notification_status,notification_sent_at,acceptance_due_at,vendors(business_name)');if(leadId)q=q.eq('lead_id',leadId);return q.order('id').range(from,to);},'network_assignments') as unknown as (NetworkAssignment & {vendors:{business_name:string}|{business_name:string}[]|null})[];
 if(!assignments.length)return{assignments,reports:[] as NetworkReport[],invitations:[] as NetworkInvitation[]};
 // Chunk IDs to keep PostgREST URLs bounded as the network grows.
 const reports:NetworkReport[]=[],invitations:NetworkInvitation[]=[];
 for(let offset=0;offset<assignments.length;offset+=100){const ids=assignments.slice(offset,offset+100).map(a=>a.id);
 reports.push(...await readAllRows((from,to)=>db.from('network_reports').select('id,assignment_id,party,contact,outcome,rating,note,help_requested,created_at,disputed,excluded').in('assignment_id',ids).order('id').range(from,to),'network_reports') as NetworkReport[]);
 invitations.push(...await readAllRows((from,to)=>db.from('network_invitations').select('id,assignment_id,party,status,created_at,sent_at,expires_at,revoked_at,error_code').in('assignment_id',ids).order('id').range(from,to),'network_invitations') as NetworkInvitation[]);
 }
 return{assignments:assignments.map(a=>({...a,vendor_name:(Array.isArray(a.vendors)?a.vendors[0]:a.vendors)?.business_name})).sort((a,b)=>b.assigned_at.localeCompare(a.assigned_at)),reports,invitations};
}
export async function loadNetworkPermission(leadId:string){
 await requireAdminAccess();const {data,error}=await getSupabaseAdmin().from('leads').select('network_consent_version,network_consented_at,checkins_stopped_at').eq('id',leadId).single();
 if(error)throw Error('network_permission_load');return data as {network_consent_version:string|null;network_consented_at:string|null;checkins_stopped_at:string|null};
}

export async function loadReviewEvents(reportIds:string[]){
 await requireAdminAccess();if(!reportIds.length)return[];
 const result:{id:string;report_id:string;action:string;reason:string;created_at:string;actor_user_id:string}[]=[];
 for(let i=0;i<reportIds.length;i+=100)result.push(...await readAllRows((from,to)=>getSupabaseAdmin().from('network_review_events').select('id,report_id,action,reason,created_at,actor_user_id').in('report_id',reportIds.slice(i,i+100)).order('created_at').order('id').range(from,to),'network_review_events') as typeof result);
 return result;
}
export function networkSnapshotTime(){return Date.now();}

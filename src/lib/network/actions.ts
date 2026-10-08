'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {resolveAdminAccess} from '../admin/authorize.ts';
import {getSupabaseAdmin} from '../supabase/admin.ts';
import {hashOpportunityToken,isOpportunityToken} from '../opportunity/token.ts';
import {loadCheckin,sendNetworkCheckin} from './checkin.ts';
import {validateReport} from './policy.ts';
const uuid=/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
export async function submitCheckin(form:FormData){
 const token=String(form.get('token')??'');const view=await loadCheckin(token);if(!view)redirect('/check-in/unavailable');
 const checked=validateReport({contact:form.get('contact'),outcome:form.get('outcome'),rating:form.get('rating'),note:form.get('note')??'',helpRequested:form.get('helpRequested')==='on'},view.party,view.accepted);
 if(!checked.ok)redirect(`/check-in/${token}?error=${encodeURIComponent(checked.error)}`);
 const {data,error}=await getSupabaseAdmin().rpc('submit_network_report',{p_token_hash:hashOpportunityToken(token),p_contact:checked.contact,p_outcome:checked.outcome,p_rating:checked.rating,p_note:checked.note,p_help_requested:checked.helpRequested});
 const row=Array.isArray(data)?data[0]:data;if(error||!row?.ok)redirect(`/check-in/${token}?error=${encodeURIComponent('We could not save that update. Check the answers and try again.')}`);
 revalidatePath('/admin/queue');revalidatePath(`/check-in/${token}`);redirect(`/check-in/${token}?saved=1`);
}
export async function stopCheckins(form:FormData){
 const token=String(form.get('token')??'');if(process.env.ENABLE_NETWORK_FOLLOWUP!=='true'||!isOpportunityToken(token))redirect('/check-in/unavailable');
 const {data,error}=await getSupabaseAdmin().rpc('stop_network_checkins',{p_token_hash:hashOpportunityToken(token)});
 if(error||data!==true)redirect(`/check-in/${token}?error=${encodeURIComponent('Could not update your preference. Please contact A5.')}`);
 revalidatePath(`/check-in/${token}`);redirect(`/check-in/${token}?stopped=1`);
}
export async function networkAdminAction(form:FormData){
 const access=await resolveAdminAccess();if(!access.ok)redirect('/admin/login');
 const leadId=String(form.get('leadId')??''),assignmentId=String(form.get('assignmentId')??''),action=String(form.get('action')??'');
 if(process.env.ENABLE_NETWORK_FOLLOWUP!=='true'||!uuid.test(leadId))redirect('/admin/queue');
 const back=(kind:string,message:string):never=>redirect(`/admin/leads/${leadId}?${kind}=${encodeURIComponent(message)}#network`);
 const db=getSupabaseAdmin();
 if(action==='permission'){
  const reason=String(form.get('reason')??'').trim();
  if(form.get('homeownerRequested')!=='on'||!reason||reason.length>1000)back('error','Record when and how the homeowner requested follow-up.');
  const {data,error}=await db.rpc('admin_record_network_permission',{p_lead_id:leadId,p_reason:reason,p_actor_user_id:access.userId});
  if(error||data!==true)back('error','Could not record permission.');
 }else if(action==='moderate'){
  const reportId=String(form.get('reportId')??'');if(!uuid.test(reportId))back('error','Choose a report.');
  const report=await db.from('network_reports').select('lead_assignments!inner(lead_id)').eq('id',reportId).maybeSingle();
  const linked=report.data?.lead_assignments as unknown as {lead_id:string}|{lead_id:string}[]|null;
  if(report.error||(Array.isArray(linked)?linked[0]?.lead_id:linked?.lead_id)!==leadId)back('error','Report does not match this request.');
  const {data,error}=await db.rpc('admin_moderate_network_report',{p_report_id:reportId,p_action:String(form.get('decision')??''),p_reason:String(form.get('reason')??''),p_actor_user_id:access.userId});
  if(error||data!==true)back('error','Choose a review decision and record the reason.');
 }else{
  if(!uuid.test(assignmentId))back('error','Choose an assignment.');
  // The hidden lead field cannot direct actions onto an unrelated request.
  const assignment=await db.from('lead_assignments').select('lead_id').eq('id',assignmentId).maybeSingle();
  if(assignment.error||assignment.data?.lead_id!==leadId)back('error','Assignment does not match this request.');
  if(action==='send'){
   const party=String(form.get('party')??'');if(party!=='HOMEOWNER'&&party!=='VENDOR')back('error','Choose the recipient.');
   const result=await sendNetworkCheckin(assignmentId,party as 'HOMEOWNER'|'VENDOR',access.userId,form.get('retryUncertain')==='on');
   if(!result.ok)back('error',`Check-in not confirmed: ${result.code.replaceAll('_',' ')}. Inspect delivery history before retrying.`);
  }else if(action==='release'){
   const {data,error}=await db.rpc('admin_release_network_assignment',{p_assignment_id:assignmentId,p_actor_user_id:access.userId,p_reason:String(form.get('reason')??''),p_homeowner_requested:form.get('homeownerRequested')==='on'});
   const row=Array.isArray(data)?data[0]:data;if(error||!row?.ok)back('error',`Assignment was not released: ${(row?.error_code??'save_failed').replaceAll('_',' ')}.`);
  }else back('error','Choose an action.');
 }
 revalidatePath('/admin/queue');revalidatePath(`/admin/leads/${leadId}`);revalidatePath('/admin/vendors');
 back('notice',action==='send'?'Check-in sent.':action==='release'?'Previous access revoked. Review the request and manually choose the next provider.':'Update recorded.');
}

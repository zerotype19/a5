import {getSupabaseAdmin} from '../supabase/admin.ts';
import {hashOpportunityToken,isOpportunityToken,createOpportunityToken} from '../opportunity/token.ts';
import {sendResendEmail} from '../email/resend.ts';
import {getServiceById,type ServiceId} from '../../../config/services.ts';
import {getLocationById,type LocationId} from '../../../config/locations.ts';
import {SITE} from '../../../config/site.ts';

export function buildCheckinEmail(party:'HOMEOWNER'|'VENDOR',url:string){
 const question=party==='HOMEOWNER'?'Did the service professional get in touch? Were they able to help?':'Were you able to reach the homeowner? What happened with the project?';
 const text=`A5 Home Services is a home services connection network.\n\n${question}\n\nPlease share an update about your recent A5 request. Contact and completed work are separate questions; it is fine if the outcome is still unknown.\n\n${url}\n\nThis private link expires in 14 days. No account is needed. Feedback is private to A5 operations. It does not post a public review. ${party==='HOMEOWNER'?'You can also stop these check-ins using the link. ':''}For corrections or help, contact ${SITE.email}.`;
 const safe=text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 return{subject:'How did your A5 connection go?',text,html:`<p>${safe.replace(url, `<a href="${url}">Share a private update</a>`).replaceAll('\n','<br/>')}</p>`};
}
export async function sendNetworkCheckin(assignmentId:string,party:'HOMEOWNER'|'VENDOR',actorId:string,retryUncertain:boolean,dependencies?:{db?:ReturnType<typeof getSupabaseAdmin>;send?:typeof sendResendEmail}){
 const db=dependencies?.db??getSupabaseAdmin(),token=createOpportunityToken();
 const {data,error}=await db.rpc('admin_prepare_network_checkin',{p_assignment_id:assignmentId,p_party:party,p_token_hash:token.hash,p_actor_user_id:actorId,p_retry_uncertain:retryUncertain});
 const row=Array.isArray(data)?data[0]:data;
 if(error||!row?.ok)return{ok:false,code:row?.error_code??'prepare_failed'};
 const url=`${SITE.url.replace(/\/$/,'')}/check-in/${token.raw}`;
 const sent=await (dependencies?.send??sendResendEmail)({to:row.recipient,...buildCheckinEmail(party,url),idempotencyKey:`a5-checkin-${row.invitation_id}`});
 const status=sent.ok?'SENT':sent.error==='provider_unreachable'||/^provider_5/.test(sent.error)?'UNCERTAIN':'FAILED';
 const finished=await db.rpc('finish_network_checkin',{p_invitation_id:row.invitation_id,p_status:status,p_error:sent.ok?null:sent.error});
 if(finished.error||finished.data!==true)return{ok:false,code:'delivery_state_uncertain'};
 return sent.ok?{ok:true,code:'sent'}:{ok:false,code:status==='UNCERTAIN'?'delivery_uncertain':'delivery_failed'};
}
export async function loadCheckin(token:string,client?:ReturnType<typeof getSupabaseAdmin>){
 if(process.env.ENABLE_NETWORK_FOLLOWUP!=='true'||!isOpportunityToken(token))return null;
 const db=client??getSupabaseAdmin();
 const {data:invite,error}=await db.from('network_invitations').select('id,assignment_id,party,expires_at,revoked_at,status').eq('token_hash',hashOpportunityToken(token)).maybeSingle();
 if(error||!invite||invite.revoked_at||invite.status==='FAILED'||Date.parse(invite.expires_at)<=Date.now())return null;
 const assignment=await db.from('lead_assignments').select('accepted_at,lead_id,vendors(business_name)').eq('id',invite.assignment_id).single();
 if(assignment.error||!assignment.data)return null;
 const lead=await db.from('leads').select('service_id,location_id,checkins_stopped_at').eq('id',assignment.data.lead_id).single();
 const report=await db.from('network_reports').select('id').eq('invitation_id',invite.id).maybeSingle();
 if(lead.error||!lead.data||report.error)return null;
 const raw=assignment.data.vendors as unknown as {business_name:string}|{business_name:string}[];const vendor=Array.isArray(raw)?raw[0]:raw;
 return{party:invite.party as 'HOMEOWNER'|'VENDOR',accepted:!!assignment.data.accepted_at,submitted:!!report.data,stopped:!!lead.data.checkins_stopped_at,service:getServiceById(lead.data.service_id as ServiceId)?.name??'Home service',town:getLocationById(lead.data.location_id as LocationId)?.name??'Your area',vendorName:vendor?.business_name??'The service professional'};
}

import {getServiceById,type ServiceId} from '../../../config/services.ts';
import {getLocationById,type LocationId} from '../../../config/locations.ts';
/** Server-only delivery runner shared by the scheduled Worker and manual CLI. */
export type AlertEnvironment = {
  ENABLE_OPERATIONS_ALERTS?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  RESEND_API_KEY?: string;
  OPERATIONS_ALERT_EMAIL?: string;
};
export async function processOperationsAlerts(env: AlertEnvironment, request: typeof fetch = fetch) {
  if (env.ENABLE_OPERATIONS_ALERTS !== "true") return {enabled:false, claimed:0, sent:0, failed:0};
  const {NEXT_PUBLIC_SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:key,RESEND_API_KEY:emailKey,OPERATIONS_ALERT_EMAIL:to} = env;
  if (!url || !key || !emailKey || !to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("Missing operations delivery configuration");
  const headers = {apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json"};
  const claimed = await request(`${url}/rest/v1/rpc/claim_lead_notifications`,{method:"POST",headers,body:"{}",signal:AbortSignal.timeout(10000)});
  if (!claimed.ok) throw new Error("Unable to claim operations alerts");
  const jobs = await claimed.json() as Array<{id:string;lead_id:string;public_reference:string;kind?:string}>;
  if (!Array.isArray(jobs)) throw new Error("Invalid operations claim response");
  let sent=0,failed=0;
  for (const job of jobs) {
    let failure: string | null=null;
    try {
      const detail=await request(`${url}/rest/v1/leads?id=eq.${encodeURIComponent(job.lead_id)}&select=service_id,location_id,postal_code,archived_at,customers(email)`,{headers,signal:AbortSignal.timeout(10000)});
      if(!detail.ok)throw Error('lead_lookup');
      const lead=(await detail.json() as {service_id:string|null;location_id:string|null;postal_code:string|null;archived_at:string|null;customers:{email:string}|null}[])[0];
      if(!lead||lead.archived_at)throw Error('request_unavailable');
      const service=getServiceById(lead.service_id as ServiceId)?.name??'Home service';
      const location=getLocationById(lead.location_id as LocationId)?.name??(lead.postal_code?`ZIP ${lead.postal_code}`:'Location to review');
      const receipt=job.kind==='homeowner_receipt';
      const recipient=receipt?lead.customers?.email:to;
      if(!recipient||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient))throw Error('recipient_missing');
      const subject=receipt?`We received your ${service.toLowerCase()} request — ${job.public_reference}`:`${service} in ${location} — new request ${job.public_reference}`;
      const text=receipt?`Thanks for contacting A5 Home Services. We received your request for ${service.toLowerCase()} in ${location}.\n\nReference: ${job.public_reference}\n\nA5 is a home services network connecting homeowners with independent local professionals. We will review your request and work to make an introduction where possible. This is not a confirmed appointment. After accepting, the professional can contact you to discuss the work, estimate and scheduling.\n\nA5 does not perform or guarantee the work.\n\nQuestions or changes? Reply to this email or call (973) 437-5517.`:`A new homeowner request is ready for review.\nService: ${service}\nLocation: ${location}\nReference: ${job.public_reference}\nOpen A5 Operations: https://www.a5homeservices.com/admin/leads/${job.lead_id}\nPlease review the request and assign a matching vendor.`;
      const response=await request("https://api.resend.com/emails",{method:"POST",signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${emailKey}`,"Content-Type":"application/json","Idempotency-Key":`a5-operations-${job.id}`},body:JSON.stringify({from:"A5 Home Services <hello@a5homeservices.com>",to:[recipient],subject,text,reply_to:"hello@a5homeservices.com"})});
      if (!response.ok) failure=`provider_${response.status}`;
      else if (typeof (await response.json() as {id?:unknown}).id !== "string") failure="delivery_uncertain";
    } catch {failure="delivery_uncertain";}
    const update=await request(`${url}/rest/v1/lead_notification_outbox?id=eq.${encodeURIComponent(job.id)}&status=eq.SENDING`,{method:"PATCH",headers:{...headers,Prefer:"return=representation"},body:JSON.stringify({status:failure?"FAILED":"SENT",sent_at:failure?null:new Date().toISOString(),last_error:failure}),signal:AbortSignal.timeout(10000)});
    if (!update.ok || (await update.json() as unknown[]).length!==1) throw new Error("Delivery state update failed; inspect SENDING jobs before retry");
    if(failure)failed++;else sent++;
  }
  return {enabled:true,claimed:jobs.length,sent,failed};
}

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
  const jobs = await claimed.json() as Array<{id:string;lead_id:string;public_reference:string}>;
  if (!Array.isArray(jobs)) throw new Error("Invalid operations claim response");
  let sent=0,failed=0;
  for (const job of jobs) {
    let failure: string | null=null;
    try {
      const response=await request("https://api.resend.com/emails",{method:"POST",signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${emailKey}`,"Content-Type":"application/json","Idempotency-Key":`a5-operations-${job.id}`},body:JSON.stringify({from:"A5 Home Services <hello@a5homeservices.com>",to:[to],subject:`New project request ${job.public_reference}`,text:`A new homeowner request is ready for review.\nReference: ${job.public_reference}\nOpen A5 Operations: https://www.a5homeservices.com/admin/leads/${job.lead_id}\nPlease review coverage and coordinate follow-up.`,reply_to:"hello@a5homeservices.com"})});
      if (!response.ok) failure=`provider_${response.status}`;
      else if (typeof (await response.json() as {id?:unknown}).id !== "string") failure="delivery_uncertain";
    } catch {failure="delivery_uncertain";}
    const update=await request(`${url}/rest/v1/lead_notification_outbox?id=eq.${encodeURIComponent(job.id)}&status=eq.SENDING`,{method:"PATCH",headers:{...headers,Prefer:"return=representation"},body:JSON.stringify({status:failure?"FAILED":"SENT",sent_at:failure?null:new Date().toISOString(),last_error:failure}),signal:AbortSignal.timeout(10000)});
    if (!update.ok || (await update.json() as unknown[]).length!==1) throw new Error("Delivery state update failed; inspect SENDING jobs before retry");
    if(failure)failed++;else sent++;
  }
  return {enabled:true,claimed:jobs.length,sent,failed};
}

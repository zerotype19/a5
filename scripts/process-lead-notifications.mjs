/** Run via an owner-managed scheduler after launch verification. No sends by default.
 * node --env-file=.env.local scripts/process-lead-notifications.mjs --send
 * Sends only an operations reference/admin link, never homeowner PII.
 */
import {createClient} from '@supabase/supabase-js';
const enabled=process.argv.includes('--send')&&process.env.ENABLE_OPERATIONS_ALERTS==='true';
if(!enabled){console.log('Delivery disabled. Review docs/launch/READINESS.md before enabling.');process.exit(0);}
const {NEXT_PUBLIC_SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:key,RESEND_API_KEY:emailKey,OPERATIONS_ALERT_EMAIL:to}=process.env;
if(!url||!key||!emailKey||!to||!/^\S+@\S+\.\S+$/.test(to))throw new Error('Missing operations delivery configuration');
const db=createClient(url,key,{auth:{persistSession:false}});
const {data:jobs,error}=await db.rpc('claim_lead_notifications');if(error)throw new Error('Unable to claim operations alerts');
for(const job of jobs??[]){
 let failure=null;
 try{
  const link=`https://www.a5homeservices.com/admin/leads/${job.lead_id}`;
  const res=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${emailKey}`,'Content-Type':'application/json','Idempotency-Key':`a5-operations-${job.id}`},body:JSON.stringify({from:'A5 Home Services <hello@a5homeservices.com>',to:[to],subject:`New project request ${job.public_reference}`,text:`A new homeowner request is ready for review.\nReference: ${job.public_reference}\nOpen A5 Operations: ${link}\nPlease review coverage and coordinate follow-up.`,reply_to:'hello@a5homeservices.com'})});
  if(!res.ok)failure=`provider_${res.status}`;
 }catch{failure='delivery_uncertain';}
 const {error:updateError}=await db.from('lead_notification_outbox').update({status:failure?'FAILED':'SENT',sent_at:failure?null:new Date().toISOString(),last_error:failure}).eq('id',job.id).eq('status','SENDING');
 if(updateError)throw new Error('Delivery state update failed; inspect SENDING jobs before retry');
 console.log(failure?'Operations alert requires review':'Operations alert delivered');
}

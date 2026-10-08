import { validateSignup, SIGNUP_CONSENT_VERSION } from './validation.ts';
import { verifyTurnstileToken } from '../turnstile/verify.ts';
import { getSupabaseAdmin } from '../supabase/admin.ts';

type Dependencies = {
  enabled:()=>boolean;
  verify: typeof verifyTurnstileToken;
  save:(key:string,payload:unknown)=>Promise<{ok:boolean; code?:string}>;
};
const defaults:Dependencies={
  enabled:()=>process.env.ENABLE_VENDOR_SIGNUP==='true',
  verify:verifyTurnstileToken,
  save:async(key,payload)=>{
    const {data,error}=await getSupabaseAdmin().rpc('submit_vendor_signup',{p_submission_key:key,p_payload:payload,p_consent_version:SIGNUP_CONSENT_VERSION});
    if(error) return {ok:false};
    const row=Array.isArray(data)?data[0]:data;
    return {ok:row?.ok===true,code:row?.error_code};
  },
};
export async function submitVendorSignup(input:unknown,key:string|null,deps:Dependencies=defaults){
  if(!deps.enabled()) return {status:503,body:{success:false,message:'Vendor signup is not available right now. Please email hello@a5homeservices.com.'}};
  if(!key||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) return {status:400,body:{success:false,message:'Please reload the form and try again.'}};
  const checked=validateSignup(input);
  if(!checked.ok) return {status:400,body:{success:false,errors:checked.errors,message:'Check the highlighted fields.'}};
  const raw=input as Record<string,unknown>;
  if(raw.companyFax) return {status:400,body:{success:false,message:'Unable to submit this form.'}};
  const verified=await deps.verify(typeof raw.turnstileToken==='string'?raw.turnstileToken:null);
  if(!verified.ok) return {status:verified.reason==='misconfigured'?503:403,body:{success:false,message:'Please complete the security check again and retry. Your entries are still here.'}};
  try {
    const result=await deps.save(key,checked.data);
    if(result.ok) return {status:200,body:{success:true}};
    if(result.code==='key_conflict') return {status:409,body:{success:false,message:'This submission was already received with different details. Email hello@a5homeservices.com to update it.'}};
    if(result.code==='rate_limited') return {status:429,body:{success:false,message:'A signup for this email was received recently. Please try later or email hello@a5homeservices.com for an update.'}};
  } catch { /* Never log contact data or database details. */ }
  return {status:503,body:{success:false,message:'We could not confirm receipt. Your entries are still here; please try again.'}};
}

import {getSupabaseAdmin} from '../supabase/admin.ts';
import {requireAdminAccess} from '../admin/authorize.ts';
import {readAllRows} from '../admin/read-all.ts';
import type {SignupData} from './validation.ts';
export type VendorSignup={id:string;payload:SignupData;status:'PENDING'|'CREATED'|'LINKED'|'DISMISSED';created_at:string;consented_at:string;consent_version:string;vendor_id:string|null;reviewed_at:string|null;review_note:string|null};
export async function loadVendorSignups(pendingOnly=false):Promise<VendorSignup[]>{
 await requireAdminAccess();
 if(process.env.ENABLE_VENDOR_SIGNUP!=='true')return [];
 const db=getSupabaseAdmin();
 return await readAllRows((from,to)=>{
  let query=db.from('vendor_signups').select('id,payload,status,created_at,consented_at,consent_version,vendor_id,reviewed_at,review_note');
  if(pendingOnly)query=query.eq('status','PENDING');
  return query.order('created_at',{ascending:false}).order('id').range(from,to);
 },'vendor_signups') as VendorSignup[];
}
export async function loadVendorSignup(id:string):Promise<VendorSignup|null>{
 await requireAdminAccess();
 if(process.env.ENABLE_VENDOR_SIGNUP!=='true'||!/^[a-f\d-]{36}$/i.test(id))return null;
 const {data,error}=await getSupabaseAdmin().from('vendor_signups').select('id,payload,status,created_at,consented_at,consent_version,vendor_id,reviewed_at,review_note').eq('id',id).maybeSingle();
 if(error)throw Error('vendor_signup_load');
 return data as VendorSignup|null;
}

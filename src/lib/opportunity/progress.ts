import {requireAdminAccess} from '../admin/authorize.ts';
import {getSupabaseAdmin} from '../supabase/admin.ts';
import {readAllRows} from '../admin/read-all.ts';
export const PROGRESS_LABELS={CONTACTED:'Customer contacted',ESTIMATE_SENT:'Estimate sent',SCHEDULED:'Work scheduled',COMPLETED:'Work completed',DISQUALIFIED:'Not a fit / lead disqualified',UNREACHABLE:'Unable to reach customer'} as const;
export type VendorProgress={id:string;assignment_id:string;status:keyof typeof PROGRESS_LABELS;note:string;created_at:string;lead_assignments:{lead_id:string;vendors:{business_name:string}|null}|null};
export async function loadVendorProgress(leadId?:string):Promise<VendorProgress[]>{
 await requireAdminAccess();
 if(process.env.ENABLE_VENDOR_PROGRESS!=='true')return[];
 return await readAllRows((from,to)=>{let q=getSupabaseAdmin().from('vendor_progress_reports').select('*,lead_assignments!inner(lead_id,vendors(business_name))');if(leadId)q=q.eq('lead_assignments.lead_id',leadId);return q.order('created_at',{ascending:false}).order('id').range(from,to);},'vendor_progress') as unknown as VendorProgress[];
}

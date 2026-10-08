import {requireAdminAccess} from './authorize.ts';
import {getSupabaseAdmin} from '../supabase/admin.ts';
export async function loadLeadNotifications(leadId:string){
 await requireAdminAccess();
 const{data,error}=await getSupabaseAdmin().from('lead_notification_outbox').select('id,kind,status,created_at,sent_at,last_error').eq('lead_id',leadId).order('created_at',{ascending:false});
 if(error)throw Error('lead_notifications_load');return data;
}

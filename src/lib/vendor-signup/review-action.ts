'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {resolveAdminAccess} from '../admin/authorize.ts';
import {getSupabaseAdmin} from '../supabase/admin.ts';
export async function reviewVendorSignup(form:FormData):Promise<void>{
 const access=await resolveAdminAccess();if(!access.ok)redirect('/admin/login');
 if(process.env.ENABLE_VENDOR_SIGNUP!=='true')redirect('/admin/vendors');
 const id=String(form.get('signupId')??''),action=String(form.get('action')??''),vendor=String(form.get('vendorId')??''),note=String(form.get('note')??'').trim();
 const uuid=/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
 if(!uuid.test(id))redirect('/admin/vendors/signups');
 const fail=(message:string):never=>redirect(`/admin/vendors/signups/${id}?error=${encodeURIComponent(message)}`);
 if(!['create','link','dismiss'].includes(action)||note.length>1000||(action==='link'&&!uuid.test(vendor)))fail('Choose a review action and an existing vendor when linking. Notes must be 1000 characters or fewer.');
 const {data,error}=await getSupabaseAdmin().rpc('admin_review_vendor_signup',{p_signup_id:id,p_action:action,p_vendor_id:action==='link'?vendor:null,p_actor_user_id:access.userId,p_note:note||null});
 const row=Array.isArray(data)?data[0]:data;
 if(error||!row?.ok)fail(row?.error_code==='possible_duplicate'?'A vendor with this name or email already exists. Review and link the existing record.':row?.error_code==='already_reviewed'?'This signup was already reviewed. Refresh to see its recorded decision.':'Could not save the review. Please try again.');
 revalidatePath('/admin/queue');revalidatePath('/admin/vendors');revalidatePath('/admin/vendors/signups');revalidatePath(`/admin/vendors/signups/${id}`);
 redirect(`/admin/vendors/signups/${id}?saved=1`);
}

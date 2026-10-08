/** Owner-requested regional copy correction. Dry-run by default; guarded single-field update. */
import {mkdirSync,writeFileSync} from 'node:fs';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
const db=getSupabaseAdmin();
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong project');
const id='20000000-0000-4000-8000-000000000001';
const before='Is your repair list handyman work? What belongs on it, what to photograph, and what changes scope — for Madison, Chatham, Florham Park, and nearby NJ homes.';
const after='Is your repair list handyman work? What belongs on it, what to photograph, and what changes scope — for homes across Northern New Jersey.';
const {data:row,error}=await db.from('content_pages').select('id,meta_description,updated_at').eq('id',id).single();
if(error)throw error;
if(row.meta_description===after){console.log('Already corrected');process.exit(0);}
if(row.meta_description!==before)throw Error('Copy changed; review required');
console.log({id,before,after});
if(process.argv.includes('--apply')){
 mkdirSync('.wrangler/regional-relevance',{recursive:true});
 writeFileSync('.wrangler/regional-relevance/description-before.json',JSON.stringify(row),{flag:'wx',mode:0o600});
 const result=await db.from('content_pages').update({meta_description:after,updated_at:new Date().toISOString()}).eq('id',id).eq('updated_at',row.updated_at).eq('meta_description',before).select('id');
 if(result.error||result.data.length!==1)throw Error('Concurrent or failed update');
 console.log('Corrected one metadata field');
}

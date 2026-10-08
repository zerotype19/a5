/** Owner-authorized email-state cleanup; read-only unless --apply. */
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {readAllRows} from '../src/lib/admin/read-all.ts';
import {hasVendorEmail} from '../src/lib/admin/vendor-contact.ts';
const dir='.wrangler/free-lead-rollout';mkdirSync(dir,{recursive:true});
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong project');
const db=getSupabaseAdmin();
const rows=await readAllRows((from,to)=>db.from('vendors').select('*').order('id').range(from,to),'vendors');
const targets=rows.filter(v=>!hasVendorEmail(v.email)&&(v.status!=='INACTIVE'||v.accepting_leads));
console.log({vendors:rows.length,withoutEmail:rows.filter(v=>!hasVendorEmail(v.email)).length,toInactivate:targets.length});
if(!process.argv.includes('--apply'))process.exit(0);
if(existsSync(`${dir}/email-state-before.json`))throw Error('Prior batch exists; inspect before resuming');
writeFileSync(`${dir}/email-state-before.json`,JSON.stringify(rows,null,2),{flag:'wx',mode:0o600});
const receipt:{started:string;intent:string|null;updated:{id:string;updated_at:string}[];completed?:string}={started:new Date().toISOString(),intent:null,updated:[]};
const save=()=>writeFileSync(`${dir}/email-state-receipt.json`,JSON.stringify(receipt,null,2),{mode:0o600});save();
for(const v of targets){
 receipt.intent=v.id;save();
 let q=db.from('vendors').update({status:'INACTIVE',accepting_leads:false,updated_at:new Date().toISOString()}).eq('id',v.id).eq('updated_at',v.updated_at);
 q=v.email===null?q.is('email',null):q.eq('email',v.email);
 const {data,error}=await q.select('id,updated_at,status,accepting_leads,email');
 if(error||data?.length!==1||data[0].status!=='INACTIVE'||data[0].accepting_leads)throw Error('Write failed or row changed; inspect pending receipt');
 receipt.updated.push({id:data[0].id,updated_at:data[0].updated_at});receipt.intent=null;save();
}
receipt.completed=new Date().toISOString();save();console.log({inactivated:receipt.updated.length,completed:receipt.completed});

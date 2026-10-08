/** Exact reviewed public business contacts; preserve territory and operational history. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {readAllRows} from '../src/lib/admin/read-all.ts';
const db=getSupabaseAdmin();if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong project');
const changes=JSON.parse(readFileSync('docs/growth-wave-3/EMAIL-RECOVERY.json','utf8')) as {business_name:string;email:string;source_url:string;notes:string}[];
const rows=await readAllRows((a,b)=>db.from('vendors').select('*').order('id').range(a,b),'vendors');
const plan=changes.map(c=>{const found=rows.filter(v=>v.business_name===c.business_name);if(found.length!==1)throw Error('Ambiguous identity');const row=found[0];if(row.email===c.email)return null;if(row.email||row.status!=='INACTIVE'||rows.some(v=>v.email?.toLowerCase()===c.email.toLowerCase()))throw Error('Contact/status conflict');return{c,row};}).filter(x=>x!==null);
console.log({recoverable:plan.length});if(!process.argv.includes('--apply')||!plan.length)process.exit(0);
const prefix='.wrangler/growth-wave-3/email-recovery';if(existsSync(prefix+'-before.json'))throw Error('Prior run exists');writeFileSync(prefix+'-before.json',JSON.stringify(plan),{flag:'wx',mode:0o600});const writes:string[]=[];
for(const {c,row} of plan){writeFileSync(prefix+'-receipt.json',JSON.stringify({intent:row.id,writes}),{mode:0o600});const r=await db.from('vendors').update({email:c.email,status:'DISCOVERED',accepting_leads:false,discovery_notes:(row.discovery_notes??'')+`\n2026-10-08 public email recovery: ${c.notes} Source: ${c.source_url}. Email delivery and participation unconfirmed.`,updated_at:new Date().toISOString()}).eq('id',row.id).eq('updated_at',row.updated_at).is('email',null).select('id');if(r.error||r.data.length!==1)throw Error('Concurrent change/write failure');writes.push(row.id);writeFileSync(prefix+'-receipt.json',JSON.stringify({intent:null,writes,completed:writes.length===plan.length}),{mode:0o600});}console.log({recovered:writes.length});

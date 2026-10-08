/** Add only reviewed service mappings; preserve existing territory, status and operational history. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {readAllRows} from '../src/lib/admin/read-all.ts';
import {SERVICES} from '../config/services.ts';
const db=getSupabaseAdmin();if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong project');
const raw=readFileSync('docs/vendor-depth/SERVICE-ENRICHMENT.json','utf8');
const changes=JSON.parse(raw) as {business_name:string;email:string;add_services:string[];source_urls:string[];observed_date:string;notes:string}[];
const vendors=await readAllRows((a,b)=>db.from('vendors').select('*').order('id').range(a,b),'vendors');
const links=await readAllRows((a,b)=>db.from('vendor_services').select('*').order('vendor_id').order('service_id').range(a,b),'vendor_services');
const plan=changes.map(c=>{const matches=vendors.filter(v=>v.business_name===c.business_name&&String(v.email).toLowerCase()===c.email.toLowerCase());if(matches.length!==1||c.add_services.some(id=>!SERVICES.some(s=>s.id===id)))throw Error('Unresolved reviewed identity/service '+c.business_name);const row=matches[0];return {c,row,missing:c.add_services.filter(id=>!links.some(l=>l.vendor_id===row.id&&l.service_id===id))};}).filter(p=>p.missing.length);
console.log({businesses:plan.length,mappings:plan.reduce((n,p)=>n+p.missing.length,0)});if(!process.argv.includes('--apply'))process.exit(0);
const prefix='.wrangler/vendor-depth/enrich-'+createHash('sha256').update(raw).digest('hex').slice(0,16);if(existsSync(prefix+'-before.json'))throw Error('Prior run exists; inspect receipt before retry');
writeFileSync(prefix+'-before.json',JSON.stringify({vendors,links}),{flag:'wx',mode:0o600});
const receipt:{intent:unknown;writes:unknown[];completed?:string}={intent:null,writes:[]};const save=()=>writeFileSync(prefix+'-receipt.json',JSON.stringify(receipt,null,2),{mode:0o600});
for(const {c,row,missing} of plan){
 receipt.intent={id:row.id,services:missing,type:'notes'};save();
 const notes=String(row.discovery_notes??'')+`\nService evidence reviewed ${c.observed_date}: ${c.notes} Sources: ${c.source_urls.join(' ')}. Credentials and availability unconfirmed.`;
 const updated=await db.from('vendors').update({discovery_notes:notes,updated_at:new Date().toISOString()}).eq('id',row.id).eq('updated_at',row.updated_at).select('id');if(updated.error||updated.data.length!==1)throw Error('Concurrent vendor change '+c.business_name);
 receipt.writes.push({type:'notes',id:row.id});receipt.intent={type:'mappings',id:row.id,services:missing};save();
 const inserted=await db.from('vendor_services').insert(missing.map(service_id=>({vendor_id:row.id,service_id}))).select('service_id');if(inserted.error||inserted.data.length!==missing.length)throw Error('Mapping write failed/uncertain '+c.business_name);receipt.writes.push({type:'mappings',id:row.id,services:missing});receipt.intent=null;save();
}
receipt.completed=new Date().toISOString();save();console.log({completed:receipt.completed});

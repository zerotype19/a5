/** Data-only service seed and authored hubs; --apply requires reviewed owner-authorized release. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {readAllRows} from '../src/lib/admin/read-all.ts';
import {EXPANSION_SERVICES} from '../config/services.ts';
import {validateForPublication} from '../src/lib/authority/validate.ts';
import type {ContentPageRecord} from '../src/lib/authority/types.ts';
const db=getSupabaseAdmin();
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong project');
const pages=JSON.parse(readFileSync('content/service-expansion/pages.json','utf8')) as ContentPageRecord[];
const existing=await readAllRows((a,b)=>db.from('content_pages').select('*').order('id').range(a,b),'pages');
const services=await db.from('services').select('*');if(services.error)throw services.error;
for(const p of pages){if(!validateForPublication({page:p}).valid)throw Error('Publication validation failed '+p.slug);if(existing.some(e=>e.id===p.id||(e.page_type==='SERVICE'&&e.slug===p.slug)))throw Error('Existing hub '+p.slug);}
if(services.data.some(s=>EXPANSION_SERVICES.some(n=>n.id===s.id)))throw Error('Service already exists; reconcile before continuing');
const rewrite=(value:unknown):unknown=>{
 if(typeof value==='string')return value.replaceAll('the eight services','the listed services').replaceAll('all eight services','all service categories').replaceAll('eight home service categories','home service categories').replaceAll("Roofing is outside A5's services; if water is coming from the roof, a roofer is needed before the ceiling is closed up.",'If water is coming from the roof, request roofing help before the ceiling is closed up.').replaceAll('Roofing is not an A5 service and needs a roofer.','A roofing provider should assess a suspected roof leak.').replaceAll("Roofing is outside A5's services.",'You can request roofing help through A5.');
 if(Array.isArray(value))return value.map(rewrite);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,rewrite(v)]));return value;
};
const updates=existing.map(p=>({before:p,after:{sections:rewrite(p.sections),meta_description:rewrite(p.meta_description),direct_answer:rewrite(p.direct_answer)}})).filter(({before,after})=>Object.entries(after).some(([k,v])=>JSON.stringify(before[k])!==JSON.stringify(v)));
console.log({preflight:'passed',newServices:EXPANSION_SERVICES.length,newHubs:pages.length,copyUpdates:updates.length});
if(!process.argv.includes('--apply'))process.exit(0);
const prefix='.wrangler/vendor-depth/service-release';
if(existsSync(prefix+'-before.json')||existsSync(prefix+'-receipt.json'))throw Error('Prior release evidence exists; reconcile manually');
writeFileSync(prefix+'-before.json',JSON.stringify({services:services.data,pages:existing}),{flag:'wx',mode:0o600});
const receipt:{started:string;completed?:string;intent:unknown;writes:unknown[]}={started:new Date().toISOString(),intent:null,writes:[]};
const save=()=>writeFileSync(prefix+'-receipt.json',JSON.stringify(receipt,null,2),{mode:0o600});
receipt.intent={type:'services',ids:EXPANSION_SERVICES.map(s=>s.id)};save();
const seeded=await db.from('services').insert(EXPANSION_SERVICES).select('id');if(seeded.error||seeded.data.length!==8)throw Error('Service seed failed/uncertain');receipt.writes.push({type:'services',rows:seeded.data});receipt.intent=null;save();
const stamp=new Date().toISOString();
receipt.intent={type:'hubs',ids:pages.map(p=>p.id)};save();
const inserted=await db.from('content_pages').insert(pages.map(p=>({...p,created_at:stamp,updated_at:stamp,published_at:stamp,reviewed_at:stamp,last_reviewed_at:stamp}))).select('id');if(inserted.error||inserted.data.length!==8)throw Error('Hub insert failed/uncertain '+inserted.error?.code);receipt.writes.push({type:'hubs',rows:inserted.data});receipt.intent=null;save();
for(const {before,after} of updates){receipt.intent={type:'copy',id:before.id};save();const result=await db.from('content_pages').update({...after,updated_at:stamp,last_reviewed_at:stamp}).eq('id',before.id).eq('updated_at',before.updated_at).select('id');if(result.error||result.data.length!==1)throw Error('Copy concurrent change/write failure '+before.id);receipt.writes.push({type:'copy',id:before.id});receipt.intent=null;save();}
receipt.completed=new Date().toISOString();save();console.log({completed:receipt.completed,writes:receipt.writes.length});

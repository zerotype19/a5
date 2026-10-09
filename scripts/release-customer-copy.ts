/** Explicitly authorized copy correction; exact reviewed manifest, batches of ten, write-ahead receipts. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {validateForPublication} from '../src/lib/authority/validate.ts';
import type {ContentPageRecord} from '../src/lib/authority/types.ts';
const raw=readFileSync('content/customer-copy/manifest.json','utf8');const {updates}=JSON.parse(raw) as {updates:ContentPageRecord[]};
const sha256=createHash('sha256').update(raw).digest('hex');
const review=JSON.parse(readFileSync('docs/customer-copy/review.json','utf8'));
if(review.sha256!==sha256||review.status!=='APPROVED'||review.reviewedPages!==227)throw Error('Unreviewed manifest');
if(updates.length!==227||new Set(updates.map(p=>p.id)).size!==227||updates.some(p=>p.page_type!=='LOCATION'||!validateForPublication({page:p}).valid))throw Error('Invalid scope');
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong project');
const db=getSupabaseAdmin();const prefix='.wrangler/customer-copy/release';
if(existsSync(prefix+'-receipt.json'))throw Error('Prior receipt: reconcile before resuming');
const live=await db.from('content_pages').select('*').in('id',updates.map(p=>p.id));if(live.error||live.data.length!==227)throw Error('Incomplete preflight');
for(const p of updates){const old=live.data.find(r=>r.id===p.id);if(old.updated_at!==p.updated_at||old.status!==p.status||old.indexable!==p.indexable)throw Error('Concurrent change '+p.slug);}
console.log({preflight:'passed',pages:227,sha256});if(!process.argv.includes('--apply'))process.exit(0);
writeFileSync(prefix+'-before.json',JSON.stringify(live.data),{mode:0o600,flag:'wx'});
const receipt:{sha256:string;started:string;intent:string|null;writes:{id:string;slug:string;updated_at:string}[];completed?:string}={sha256,started:new Date().toISOString(),intent:null,writes:[]};
const save=()=>writeFileSync(prefix+'-receipt.json',JSON.stringify(receipt,null,2),{mode:0o600});save();
for(let offset=0;offset<updates.length;offset+=10){
 for(const p of updates.slice(offset,offset+10)){
  receipt.intent=p.id;save();const stamp=new Date().toISOString();
  const fields={sections:p.sections,primary_question:p.primary_question,direct_answer:p.direct_answer,meta_description:p.meta_description,reviewed_by:p.reviewed_by,reviewed_at:stamp,last_reviewed_at:stamp,updated_at:stamp};
  const r=await db.from('content_pages').update(fields).eq('id',p.id).eq('updated_at',p.updated_at).eq('status',p.status).eq('indexable',p.indexable).select('*');
  if(r.error||r.data.length!==1)throw Error('Failed or concurrent '+p.slug);
  for(const key of ['sections','primary_question','direct_answer','meta_description'] as const)if(!isDeepStrictEqual(r.data[0][key],p[key]))throw Error('Write mismatch '+p.slug);
  receipt.writes.push({id:p.id,slug:p.slug,updated_at:r.data[0].updated_at});receipt.intent=null;save();
 }
 console.log({batch:Math.floor(offset/10)+1,verified:receipt.writes.length});
}
receipt.completed=new Date().toISOString();save();console.log({completed:receipt.completed,pages:receipt.writes.length});

/** Final question/answer alignment; exact manifest, optimistic guards, write-ahead receipt. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {readAllRows} from '../src/lib/admin/read-all.ts';
const path='content/town-profiles/planning-headings.json';
const raw=readFileSync(path,'utf8');
const manifest=JSON.parse(raw) as {id:string;slug:string;location:string;before:string;after:string}[];
const queue=JSON.parse(readFileSync('docs/town-profiles/QUEUE.json','utf8')).towns as {id:string}[];
const digest=createHash('sha256').update(raw).digest('hex');
if(manifest.length!==202||new Set(manifest.map(r=>r.id)).size!==202||manifest.some(r=>!queue.some(t=>t.id===r.location)||r.after!==r.before.replace(/^How do I request home services in /,'What should I know before planning a home project in ')))throw Error('Wrong correction scope');
const review=JSON.parse(readFileSync('docs/town-profiles/planning-headings.review.json','utf8'));
if(review.sha256!==digest||review.disposition!=='APPROVED')throw Error('Unreviewed correction');
const final=JSON.parse(readFileSync('docs/town-profiles/batch-21.live.json','utf8'));
if(final.errors.length||final.count!==2)throw Error('Final batch not verified');
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong database');
const db=getSupabaseAdmin();
const pages=await readAllRows((a,b)=>db.from('content_pages').select('*').order('id').range(a,b),'content_pages');
const targets=manifest.map(row=>{
 const page=pages.find(p=>p.id===row.id);
 if(!page||page.slug!==row.slug||page.primary_location_id!==row.location||page.primary_question!==row.before||page.page_type!=='LOCATION'||page.status!=='PUBLISHED'||!page.indexable)throw Error('Changed target '+row.slug);
 return {row,page};
});
console.log({preflight:'passed',count:targets.length,sha256:digest});
if(!process.argv.includes('--apply'))process.exit(0);
const prefix='.wrangler/town-profiles/planning-headings';
if(existsSync(prefix+'-receipt.json'))throw Error('Prior receipt; inspect before any resume');
writeFileSync(prefix+'-before.json',JSON.stringify(targets.map(t=>t.page)),{mode:0o600,flag:'wx'});
const receipt:{sha256:string;started:string;intent:string|null;completed?:string;writes:unknown[]}={sha256:digest,started:new Date().toISOString(),intent:null,writes:[]};
const save=()=>writeFileSync(prefix+'-receipt.json',JSON.stringify(receipt,null,2),{mode:0o600});save();
for(const {row,page} of targets){
 receipt.intent=row.id;save();
 const stamp=new Date().toISOString();
 const r=await db.from('content_pages').update({primary_question:row.after,updated_at:stamp}).eq('id',row.id).eq('updated_at',page.updated_at).eq('primary_question',row.before).select('id');
 if(r.error||r.data.length!==1)throw Error('Failed/concurrent correction '+row.slug);
 receipt.writes.push({id:row.id,updatedAt:stamp});receipt.intent=null;save();
 if(receipt.writes.length%10===0)console.log({corrected:receipt.writes.length});
}
receipt.completed=new Date().toISOString();save();console.log({completed:receipt.completed,count:receipt.writes.length});

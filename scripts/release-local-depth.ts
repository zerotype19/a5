/** Exact-reviewed content update, default read-only. --apply publishes the manifest. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {buildLocalDepthPlan} from '../content/local-depth/plan.ts';
const dir='.wrangler/free-lead-rollout';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const snapshot=read(`${dir}/content-before.json`);
const towns=read('content/local-depth/towns.json');
const plan=buildLocalDepthPlan(snapshot,towns);
const sha256=createHash('sha256').update(JSON.stringify(plan)).digest('hex');
if(process.argv.includes('--prepare')){
 writeFileSync('docs/free-lead-rollout/CONTENT-MANIFEST.json',JSON.stringify({sha256,pages:plan.manifest},null,2)+'\n');
 writeFileSync(`${dir}/content-plan.json`,JSON.stringify(plan,null,2));
 console.log({prepared:true,updates:plan.updates.length,indexable:plan.updates.filter(p=>p.indexable).length,sources:plan.sources.length});process.exit(0);
}
if(sha256!==read('docs/free-lead-rollout/CONTENT-MANIFEST.json').sha256)throw Error('Manifest mismatch');
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong project');
const db=getSupabaseAdmin();
const live=await db.from('content_pages').select('id,updated_at').in('id',plan.updates.map(p=>p.id));
if(live.error||live.data?.length!==plan.updates.length)throw Error('Could not validate current records');
for(const p of plan.updates)if(live.data.find(l=>l.id===p.id)?.updated_at!==p.updated_at)throw Error('Concurrent edit; review new baseline');
console.log({preflight:'passed',updates:plan.updates.length,newlyIndexable:plan.updates.filter(p=>p.indexable).length});
if(!process.argv.includes('--apply'))process.exit(0);
if(existsSync(`${dir}/content-receipt.json`))throw Error('Prior write receipt exists; inspect before resuming');
const receipt:{started:string;intent:unknown;writes:unknown[];completed?:string}={started:new Date().toISOString(),intent:null,writes:[]};
const save=()=>writeFileSync(`${dir}/content-receipt.json`,JSON.stringify(receipt,null,2),{mode:0o600});save();
for(const [table,rows] of [['sources',plan.sources],['content_sources',plan.sourceLinks]] as const){
 if(!rows.length)continue;receipt.intent={table,rows};save();
 const {error}=await db.from(table).insert(rows as Record<string,unknown>[]);if(error)throw Error(`${table}:${error.code}`);
 receipt.writes.push({table,count:rows.length});receipt.intent=null;save();
}
for(const p of plan.updates){
 const now=new Date().toISOString();receipt.intent={page:p.id};save();
 const {data,error}=await db.from('content_pages').update({direct_answer:p.direct_answer,meta_description:p.meta_description,sections:p.sections,indexable:p.indexable,reviewed_by:p.reviewed_by,reviewed_at:now,last_reviewed_at:now,updated_at:now}).eq('id',p.id).eq('updated_at',p.updated_at).eq('status','PUBLISHED').select('id,updated_at');
 if(error||data?.length!==1)throw Error(`Page write failed/concurrent change:${p.slug}`);
 receipt.writes.push(data[0]);receipt.intent=null;save();
}
receipt.completed=new Date().toISOString();save();console.log({completed:receipt.completed,writes:receipt.writes.length});

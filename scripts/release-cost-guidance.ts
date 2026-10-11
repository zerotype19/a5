/** Owner-authorized, additive cost library release. Dry-run by default; no operational tables. */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {validateForPublication} from '../src/lib/authority/validate.ts';
import {SERVICES} from '../config/services.ts';
import type {ContentPageRecord,SourceRecord,ContentSourceLink,ContentRelationship} from '../src/lib/authority/types.ts';
const raw=readFileSync('content/cost-guidance/publication.json','utf8');
const plan=JSON.parse(raw) as {pages:ContentPageRecord[];sources:SourceRecord[];sourceLinks:ContentSourceLink[]};
const digest=createHash('sha256').update(raw).digest('hex');
const approved=JSON.parse(readFileSync('docs/cost-guidance/MANIFEST.json','utf8'));
if(digest!==approved.sha256)throw Error('Manifest changed since review');
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong project');
if(plan.pages.length!==17 || SERVICES.some(s=>plan.pages.filter(p=>p.primary_service_id===s.id).length!==1))throw Error('Category coverage mismatch');
const db=getSupabaseAdmin();
const {data:existing,error}=await db.from('content_pages').select('id,slug,page_type,primary_service_id').in('page_type',['SERVICE','COST_GUIDE']);
if(error||!existing)throw Error('Cannot read content baseline');
for(const p of plan.pages){
 const attached=plan.sources.filter(s=>plan.sourceLinks.some(l=>l.content_page_id===p.id&&l.source_id===s.id));
 if(!validateForPublication({page:p,sources:attached}).valid)throw Error('Invalid publication '+p.slug);
 if(existing.some(e=>e.id===p.id||(e.page_type===p.page_type&&e.slug===p.slug)))throw Error('Existing page; inspect prior release '+p.slug);
 for(const section of p.sections)if(section.type==='COST_ESTIMATES')for(const row of section.rows)if(!attached.some(s=>s.id===row.source_id))throw Error('Missing price source '+p.slug);
}
const relationships:ContentRelationship[]=[];
const faq=plan.pages.find(p=>!p.primary_service_id)!;
for(const p of plan.pages.filter(p=>p.primary_service_id)){
 const service=existing.find(s=>s.page_type==='SERVICE'&&s.primary_service_id===p.primary_service_id);
 if(!service)throw Error('Missing service parent '+p.slug);
 relationships.push({from_page_id:service.id,to_page_id:p.id,relationship_type:'COST_GUIDE'},{from_page_id:p.id,to_page_id:service.id,relationship_type:'PARENT'},{from_page_id:p.id,to_page_id:faq.id,relationship_type:'SUPPORTING_GUIDE'});
}
const sourceCheck=await db.from('sources').select('id').in('id',plan.sources.map(s=>s.id));
if(sourceCheck.error||sourceCheck.data?.length)throw Error('Cannot insert fresh source IDs; inspect prior release');
console.log({preflight:'passed',pages:plan.pages.length,sources:plan.sources.length,relationships:relationships.length,sha256:digest});
if(!process.argv.includes('--apply'))process.exit(0);
const folder='.wrangler/cost-guidance';mkdirSync(folder,{recursive:true});
const receiptPath=folder+'/release-receipt.json';if(existsSync(receiptPath))throw Error('Existing receipt; reconcile partial release before retrying');
const receipt:{sha256:string;started:string;intent:unknown;writes:unknown[];completed?:string}={sha256:digest,started:new Date().toISOString(),intent:null,writes:[]};
const save=()=>writeFileSync(receiptPath,JSON.stringify(receipt,null,2),{mode:0o600});
writeFileSync(folder+'/before.json',JSON.stringify({content:existing}),{flag:'wx',mode:0o600});
async function insert(table:string,rows:unknown[]){receipt.intent={table,count:rows.length};save();const result=await db.from(table).insert(rows).select();if(result.error||result.data?.length!==rows.length)throw Error('Insert failed or uncertain '+table+': '+result.error?.code);receipt.writes.push({table,count:result.data.length});receipt.intent=null;save();}
// Pages are not publicly readable until all source and relationship writes have succeeded.
await insert('sources',plan.sources);
await insert('content_pages',plan.pages.map(p=>({...p,status:'APPROVED',indexable:false,published_at:null})));
await insert('content_sources',plan.sourceLinks);
await insert('content_relationships',relationships);
receipt.intent={publish:plan.pages.map(p=>p.id)};save();
const stamp=new Date().toISOString();
const published=await db.from('content_pages').update({status:'PUBLISHED',indexable:true,published_at:stamp,updated_at:stamp}).in('id',plan.pages.map(p=>p.id)).eq('status','APPROVED').eq('indexable',false).select('id');
if(published.error||published.data?.length!==17)throw Error('Publish failed or uncertain: '+published.error?.code);
receipt.writes.push({published:published.data.map(p=>p.id)});receipt.intent=null;receipt.completed=stamp;save();console.log({completed:stamp,pages:17});

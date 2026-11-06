/** Bounded owner-authorized editorial release. Dry-run unless --apply. */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {validateForPublication} from '../src/lib/authority/validate.ts';
import {buildContentPathFromRecord} from '../src/lib/authority/urls.ts';
import type {ContentPageRecord,SourceRecord,ContentSourceLink,ContentRelationship} from '../src/lib/authority/types.ts';
type Patch={id:string;slug:string;expected_updated_at:string;fields:{sections:ContentPageRecord['sections']}};
const raw=readFileSync('content/cost-expansion/publication.json','utf8');
const plan=JSON.parse(raw) as {pages:ContentPageRecord[];sources:SourceRecord[];sourceLinks:ContentSourceLink[];relationships:ContentRelationship[];patches:Patch[]};
const manifest=JSON.parse(readFileSync('docs/cost-expansion/MANIFEST.json','utf8'));
if(createHash('sha256').update(raw).digest('hex')!==manifest.sha256 || plan.pages.length!==12 || plan.patches.length!==16 || plan.sources.length!==6)throw Error('Manifest or scope mismatch');
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong database');
const db=getSupabaseAdmin();
const result=await db.from('content_pages').select('*').order('id').range(0,999);
if(result.error||!result.data||result.data.length===1000)throw Error('Incomplete content baseline');
const existing=result.data as ContentPageRecord[];
for(const p of plan.patches){const row=existing.find(e=>e.id===p.id);if(!row||row.updated_at!==p.expected_updated_at||row.status!=='PUBLISHED'||!row.indexable)throw Error('Concurrent change '+p.slug);}
for(const p of plan.pages){
 if(existing.some(e=>e.id===p.id||(e.slug===p.slug&&e.page_type===p.page_type)))throw Error('Existing page: reconcile '+p.slug);
 const sources=plan.sources.filter(s=>plan.sourceLinks.some(l=>l.content_page_id===p.id&&l.source_id===s.id));
 if(!validateForPublication({page:p,sources}).valid)throw Error('Publication validation '+p.slug);
}
const known=new Set([...existing.filter(p=>p.status==='PUBLISHED'&&p.indexable),...plan.pages].map(p=>buildContentPathFromRecord(p)));
for(const p of [...plan.pages,...plan.patches.map(p=>({...existing.find(e=>e.id===p.id)!,...p.fields}))])for(const s of p.sections)if(s.type==='RICH_TEXT')for(const l of [...(s.links??[]),...(s.items??[]).flatMap(i=>i.links??[])]){
 if(!known.has(l.href)&&!['/cost-guides','/how-it-works','/guides','/home-services'].includes(l.href))throw Error('Unknown content link '+l.href);
}
const allIds=new Set([...existing,...plan.pages].map(p=>p.id));
for(const r of plan.relationships)if(!allIds.has(r.from_page_id)||!allIds.has(r.to_page_id))throw Error('Missing relationship endpoint');
const sourceResult=await db.from('sources').select('id').in('id',plan.sources.map(s=>s.id));if(sourceResult.error||sourceResult.data?.length)throw Error('Sources already exist; reconcile');
console.log({preflight:'passed',newPages:plan.pages.length,updatedPages:plan.patches.length,relationships:plan.relationships.length});
if(!process.argv.includes('--apply'))process.exit(0);
const folder='.wrangler/cost-expansion';mkdirSync(folder,{recursive:true});const path=folder+'/receipt.json';if(existsSync(path))throw Error('Receipt exists; reconcile partial release before retry');
const receipt:{before:ContentPageRecord[];intent:unknown;writes:unknown[];completed?:string}={before:existing.filter(p=>plan.patches.some(x=>x.id===p.id)),intent:null,writes:[]};
const save=()=>writeFileSync(path,JSON.stringify(receipt,null,2),{mode:0o600});save();
async function insert(table:string,rows:unknown[]){receipt.intent={table,count:rows.length};save();const r=await db.from(table).insert(rows).select();if(r.error||r.data?.length!==rows.length)throw Error('Write failed or uncertain '+table+' '+r.error?.code);receipt.writes.push({table,count:r.data.length});receipt.intent=null;save();}
await insert('sources',plan.sources);
await insert('content_pages',plan.pages.map(p=>({...p,status:'APPROVED',indexable:false,published_at:null})));
await insert('content_sources',plan.sourceLinks);
await insert('content_relationships',plan.relationships);
// Existing pages link to the new pages only once the new records are public.
receipt.intent={publish:plan.pages.map(p=>p.id)};save();
const stamp=new Date().toISOString();
const pub=await db.from('content_pages').update({status:'PUBLISHED',indexable:true,published_at:stamp,updated_at:stamp}).in('id',plan.pages.map(p=>p.id)).eq('status','APPROVED').eq('indexable',false).select('id');
if(pub.error||pub.data?.length!==12)throw Error('Publication uncertain');receipt.writes.push({published:pub.data.length});receipt.intent=null;save();
for(const p of plan.patches){receipt.intent={update:p.id};save();const r=await db.from('content_pages').update({...p.fields,updated_at:stamp}).eq('id',p.id).eq('updated_at',p.expected_updated_at).select('id');if(r.error||r.data?.length!==1)throw Error('Concurrent/uncertain update '+p.slug);receipt.writes.push({updated:p.id});receipt.intent=null;save();}
receipt.completed=stamp;save();console.log({completed:stamp});

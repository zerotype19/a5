/** Exact authored manifest; default dry-run. Additive publication with private intent/receipt evidence. */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {readAllRows} from '../src/lib/admin/read-all.ts';
import {validateForPublication} from '../src/lib/authority/validate.ts';
import type {ContentPageRecord,ProblemRecord,SourceRecord,ContentSourceLink,ContentRelationship} from '../src/lib/authority/types.ts';
const raw=readFileSync('content/growth-wave-3/manifest.json','utf8');
const manifest=JSON.parse(raw) as {pages:ContentPageRecord[];problems:ProblemRecord[];problem_services:{problem_id:string;service_id:string}[];sources:SourceRecord[];content_sources:ContentSourceLink[];content_relationships:ContentRelationship[]};
const db=getSupabaseAdmin();if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong project');
const existing=await readAllRows((a,b)=>db.from('content_pages').select('*').order('id').range(a,b),'pages');
const oldProblems=await db.from('problems').select('*');if(oldProblems.error)throw oldProblems.error;
const oldSources=await db.from('sources').select('*');if(oldSources.error)throw oldSources.error;
for(const p of manifest.pages){const validation=validateForPublication({page:p,relatedServiceIds:manifest.problem_services.filter(r=>r.problem_id===p.primary_problem_id).map(r=>r.service_id),otherSlugsForType:existing.filter(r=>r.page_type===p.page_type).map(r=>r.slug)});if(!validation.valid)throw Error(p.slug+': '+JSON.stringify(validation.issues));if(existing.some(r=>r.id===p.id))throw Error('Page already exists');}
for(const p of manifest.problems)if(oldProblems.data.some(r=>r.id===p.id||r.slug===p.slug))throw Error('Problem collision '+p.slug);
const allPageIds=new Set([...existing,...manifest.pages].map(p=>p.id));for(const r of manifest.content_relationships)if(!allPageIds.has(r.from_page_id)||!allPageIds.has(r.to_page_id)||r.from_page_id===r.to_page_id)throw Error('Invalid relationship');
// Reuse canonical source rows when a previous wave already cited the same URL.
const sourceIds=new Map(manifest.sources.map(s=>[s.id,oldSources.data.find(r=>r.url===s.url)?.id??s.id]));
const sources=manifest.sources.filter(s=>sourceIds.get(s.id)===s.id);
const sourceLinks=manifest.content_sources.map(s=>({...s,source_id:sourceIds.get(s.source_id)!}));
const summary={pages:manifest.pages.length,problems:manifest.problems.length,sources:sources.length,relationships:manifest.content_relationships.length};console.log({preflight:'passed',...summary});
if(!process.argv.includes('--apply'))process.exit(0);
mkdirSync('.wrangler/growth-wave-3',{recursive:true});const prefix='.wrangler/growth-wave-3/content-'+createHash('sha256').update(raw).digest('hex').slice(0,16);if(existsSync(prefix+'-receipt.json'))throw Error('Prior release receipt exists; inspect before retry');
writeFileSync(prefix+'-before.json',JSON.stringify({existing,problems:oldProblems.data,sources:oldSources.data}),{flag:'wx',mode:0o600});
const stamp=new Date().toISOString();const receipt:{started:string;intent:unknown;writes:unknown[];completed?:string}={started:stamp,intent:null,writes:[]};const save=()=>writeFileSync(prefix+'-receipt.json',JSON.stringify(receipt,null,2),{mode:0o600});
for(const [table,rows] of [['problems',manifest.problems],['problem_services',manifest.problem_services],['sources',sources],['content_pages',manifest.pages.map(p=>({...p,created_at:stamp,updated_at:stamp,published_at:stamp,reviewed_at:stamp,last_reviewed_at:stamp}))],['content_sources',sourceLinks],['content_relationships',manifest.content_relationships]] as const){if(!rows.length)continue;receipt.intent={table,count:rows.length};save();const r=await db.from(table).insert(rows as Record<string,unknown>[]).select();if(r.error||r.data.length!==rows.length)throw Error('Write failed/uncertain '+table+' '+r.error?.code);receipt.writes.push({table,count:r.data.length});receipt.intent=null;save();}
receipt.completed=new Date().toISOString();save();console.log({completed:receipt.completed,...summary});

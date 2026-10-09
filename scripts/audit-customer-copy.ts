/** Draft/live reconciliation. Reports counts only; vendor records remain in private snapshots. */
import {readFileSync,writeFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {createHash} from 'node:crypto';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {readAllRows} from '../src/lib/admin/read-all.ts';
import {validateForPublication} from '../src/lib/authority/validate.ts';
import type {ContentPageRecord} from '../src/lib/authority/types.ts';
type Row=Record<string,unknown>;
const before=JSON.parse(readFileSync('.wrangler/customer-copy/before.json','utf8')) as Record<string,Row[]>;
const raw=readFileSync('content/customer-copy/manifest.json','utf8');const {updates}=JSON.parse(raw) as {updates:ContentPageRecord[]};
const expected=new Map(updates.map(p=>[p.id,p]));const errors:string[]=[];
const allowed=new Set(['sections','primary_question','direct_answer','meta_description','reviewed_by','reviewed_at','last_reviewed_at','updated_at']);
const edited=['sections','primary_question','direct_answer','meta_description','reviewed_by'] as const;
if(updates.length!==227||expected.size!==227)errors.push('Scope count');
for(const p of updates){
 const old=before.content_pages.find(o=>o.id===p.id);if(!old||p.page_type!=='LOCATION'||!validateForPublication({page:p}).valid){errors.push('Invalid scope '+p.slug);continue;}
 for(const [key,value]of Object.entries(p))if(!allowed.has(key)&&!isDeepStrictEqual(value,old[key]))errors.push('Changed invariant '+p.slug+'/'+key);
 if(!p.meta_description||p.meta_description.length>180)errors.push('Metadata '+p.slug);
 if(p.sections.some(s=>s.type==='RICH_TEXT'&&s.items?.some(i=>i.links?.some(l=>/Explore (hvac|gutters) projects/.test(l.label)))))errors.push('Slug label '+p.slug);
 if(p.created_by!=='cursor-authority-draft'&&p.sections[0].type==='RICH_TEXT'&&p.sections[0].items?.length!==3)errors.push('Project examples '+p.slug);
 if(p.sections.some(s=>s.type==='SOURCE_LIST')&&!before.content_sources.some(l=>l.content_page_id===p.id))errors.push('Missing source '+p.slug);
}
const rewritten=updates.filter(p=>p.created_by!=='cursor-authority-draft');if(new Set(rewritten.map(p=>p.direct_answer)).size!==221)errors.push('Duplicate introduction');
let unchanged:Record<string,boolean>={};
if(process.argv.includes('--live')){
 if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong database');
 const db=getSupabaseAdmin();const live:Record<string,Row[]>={};
 for(const[table,columns]of Object.entries({content_pages:['id'],sources:['id'],content_sources:['content_page_id','source_id','relationship_type'],content_relationships:['from_page_id','to_page_id','relationship_type'],vendors:['id'],vendor_services:['vendor_id','service_id'],vendor_locations:['vendor_id','location_id']}))live[table]=await readAllRows((a,b)=>{let q=db.from(table).select('*');for(const c of columns)q=q.order(c);return q.range(a,b);},table);
 writeFileSync('.wrangler/customer-copy/after.json',JSON.stringify(live),{mode:0o600});
 if(live.content_pages.length!==before.content_pages.length)errors.push('Page count changed');
 for(const old of before.content_pages){const now=live.content_pages.find(p=>p.id===old.id);if(!now){errors.push('Missing original');continue;}const p=expected.get(old.id as string);
  for(const key of Object.keys(old))if((!p||!allowed.has(key))&&!isDeepStrictEqual(now[key],old[key]))errors.push('Unexpected live edit '+old.slug+'/'+key);
  if(p)for(const key of edited)if(!isDeepStrictEqual(p[key],now[key]))errors.push('Live copy mismatch '+p.slug+'/'+key);
 }
 const normalize=(rows:Row[])=>rows.map(r=>JSON.stringify(Object.fromEntries(Object.entries(r).sort(([a],[b])=>a.localeCompare(b))))).sort();
 unchanged=Object.fromEntries(Object.keys(before).filter(t=>t!=='content_pages').map(t=>[t,isDeepStrictEqual(normalize(before[t]),normalize(live[t]))]));
 for(const[t,ok]of Object.entries(unchanged))if(!ok)errors.push('Changed '+t);
}
const evidence={checkedAt:new Date().toISOString(),sha256:createHash('sha256').update(raw).digest('hex'),pages:updates.length,rewritten:221,lightlyEdited:6,unchanged,errors};
writeFileSync(`docs/customer-copy/${process.argv.includes('--live')?'database-live':'draft-audit'}.json`,JSON.stringify(evidence,null,2)+'\n');console.log(evidence);if(errors.length)process.exitCode=1;

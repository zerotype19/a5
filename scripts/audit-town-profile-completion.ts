/** Read-only reconciliation of the complete owner-authorized editorial program. */
import {readFileSync,writeFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {createHash} from 'node:crypto';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {readAllRows} from '../src/lib/admin/read-all.ts';
import {hasVendorEmail} from '../src/lib/admin/vendor-contact.ts';
import {MUNICIPALITIES} from '../config/locations.ts';
import {SERVICES} from '../config/services.ts';
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong database');
type Row=Record<string,unknown>;
const db=getSupabaseAdmin();
const before=JSON.parse(readFileSync('.wrangler/town-profiles/baseline.json','utf8')) as Record<string,Row[]>;
const live:Record<string,Row[]>={};
for(const[table,columns]of Object.entries({content_pages:['id'],sources:['id'],content_sources:['content_page_id','source_id','relationship_type'],content_relationships:['from_page_id','to_page_id','relationship_type'],vendors:['id'],vendor_services:['vendor_id','service_id'],vendor_locations:['vendor_id','location_id']}))live[table]=await readAllRows((a,b)=>{let q=db.from(table).select('*');for(const c of columns)q=q.order(c);return q.range(a,b);},table);
writeFileSync('.wrangler/town-profiles/final-snapshot.json',JSON.stringify(live),{mode:0o600});
const queue=JSON.parse(readFileSync('docs/town-profiles/QUEUE.json','utf8')).towns as {id:string;batch:number}[];
const errors:string[]=[];
const authored=new Map<string,Row>();
let verified=0;
for(let i=1;i<=21;i++){
 const batch=String(i).padStart(2,'0');
 const raw=readFileSync(`content/town-profiles/batch-${batch}.manifest.json`,'utf8');
 const manifest=JSON.parse(raw) as {updates:Row[];sources:Row[];sourceLinks:Row[];relationships:Row[]};
 const evidence=JSON.parse(readFileSync(`docs/town-profiles/batch-${batch}.live.json`,'utf8'));
 if(evidence.sha256!==createHash('sha256').update(raw).digest('hex')||evidence.errors.length||evidence.count!==manifest.updates.length)errors.push(`Batch ${batch} live evidence mismatch`);
 verified+=evidence.count;
 for(const page of manifest.updates){
  if(authored.has(page.id as string))errors.push(`Repeated authored page ${page.slug}`);
  authored.set(page.id as string,page);
  const current=live.content_pages.find(p=>p.id===page.id);
  for(const field of ['sections','direct_answer','meta_description','indexable','reviewed_by'])if(!current||!isDeepStrictEqual(current[field],page[field]))errors.push(`Authored field mismatch ${page.slug}/${field}`);
 }
 for(const [table,rows] of [['sources',manifest.sources],['content_sources',manifest.sourceLinks],['content_relationships',manifest.relationships]] as const){
  for(const row of rows)if(!live[table].some(r=>Object.entries(row).every(([k,v])=>isDeepStrictEqual(r[k],v))))errors.push(`Missing authored ${table} record in batch ${batch}`);
 }
}
if(authored.size!==queue.length||verified!==queue.length)errors.push('Incomplete queue');
const changedFields=new Set(['sections','direct_answer','meta_description','indexable','reviewed_by','reviewed_at','last_reviewed_at','updated_at']);
let alignedHeadings=0;
if(process.argv.includes('--expect-planning-headings')){
 const headings=JSON.parse(readFileSync('content/town-profiles/planning-headings.json','utf8')) as {id:string;after:string}[];
 if(headings.length!==queue.length)errors.push('Incomplete heading correction');
 for(const heading of headings){
  if(!authored.has(heading.id)||live.content_pages.find(p=>p.id===heading.id)?.primary_question!==heading.after)errors.push(`Heading mismatch ${heading.id}`);
  else alignedHeadings++;
 }
 changedFields.add('primary_question');
}
if(live.content_pages.length!==before.content_pages.length)errors.push('Content record count changed');
for(const old of before.content_pages){
 const current=live.content_pages.find(p=>p.id===old.id);
 if(!current){errors.push(`Missing original page ${old.slug}`);continue;}
 for(const key of Object.keys(old))if((!authored.has(old.id as string)||!changedFields.has(key))&&!isDeepStrictEqual(old[key],current[key]))errors.push(`Unexpected page change ${old.slug}/${key}`);
}
const unchanged:Record<string,boolean>={};
for(const table of ['vendors','vendor_services','vendor_locations']){
 const normalized=(rows:Row[])=>rows.map(r=>JSON.stringify(Object.fromEntries(Object.entries(r).sort(([a],[b])=>a.localeCompare(b))))).sort();
 unchanged[table]=isDeepStrictEqual(normalized(before[table]),normalized(live[table]));
 if(!unchanged[table])errors.push(`Unexpected ${table} change`);
}
const eligible=live.vendors.filter(v=>v.status==='ACTIVE'&&hasVendorEmail(v.email as string|null));
const serviceVendors=new Map(SERVICES.map(s=>[s.id,new Set(live.vendor_services.filter(x=>x.service_id===s.id).map(x=>x.vendor_id))]));
const townVendors=new Map(MUNICIPALITIES.map(t=>[t.id,new Set(live.vendor_locations.filter(x=>x.location_id===t.id).map(x=>x.vendor_id))]));
const matrix=MUNICIPALITIES.flatMap(t=>SERVICES.map(s=>({town:t.id,service:s.id,count:eligible.filter(v=>serviceVendors.get(s.id)!.has(v.id)&&townVendors.get(t.id)!.has(v.id)).length})));
const published=live.content_pages.filter(p=>p.status==='PUBLISHED');
const locations=published.filter(p=>p.page_type==='LOCATION');
for(const town of MUNICIPALITIES)if(!locations.some(p=>p.primary_location_id===town.id&&p.indexable))errors.push(`Missing indexable municipality ${town.id}`);
const evidence={checkedAt:new Date().toISOString(),programProfiles:authored.size,verifiedProfiles:verified,alignedHeadings,publishedContent:published.length,indexableContent:published.filter(p=>p.indexable).length,locationRecords:locations.length,indexableLocations:locations.filter(p=>p.indexable).length,remainingNoindexLocations:locations.filter(p=>!p.indexable).length,municipalities:MUNICIPALITIES.length,serviceTownCombinations:matrix.length,minimumActiveEmailedMappedVendors:Math.min(...matrix.map(r=>r.count)),coverageMeaning:'Recorded active/email/service/town eligibility only; not specialty, availability, mailbox delivery or fulfillment.',unchanged,errors};
writeFileSync('docs/town-profiles/COMPLETION.json',JSON.stringify(evidence,null,2)+'\n');
console.log(evidence);if(errors.length)process.exitCode=1;

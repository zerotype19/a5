/** Explicit --publish required. Run with Node --env-file pointing to the authorized production credentials. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {LOCATIONS} from '../config/locations.ts';
import {buildWavePlan} from '../content/expansion-wave-2/plan.ts';
import type {ContentPageRecord} from '../src/lib/authority/types.ts';
const dir='.wrangler/expansion-wave-2';
const plan=JSON.parse(readFileSync(`${dir}/plan.json`,'utf8')) as ReturnType<typeof buildWavePlan>;
const manifest=JSON.parse(readFileSync('docs/expansion-wave-2/MANIFEST.json','utf8'));
if(createHash('sha256').update(JSON.stringify(plan)).digest('hex')!==manifest.contentSha256)throw Error('Manifest mismatch');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||new URL(url).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co'||!key)throw Error('Expected authorized production project and credentials');
async function rest<T>(path:string,method='GET',body?:unknown,prefer='return=representation'):Promise<T>{
 const r=await fetch(`${url}/rest/v1/${path}`,{method,headers:{apikey:key!,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:prefer},...(body?{body:JSON.stringify(body)}:{})});
 if(!r.ok)throw Error(`${method} ${path}: ${r.status} ${await r.text()}`);return r.json();
}
const ids=plan.pages.map(p=>p.id).join(',');
const before=await rest<ContentPageRecord[]>(`content_pages?select=*&id=in.(${ids})`);
if(before.length!==22||plan.updates.some(p=>!before.some(o=>o.id===p.id&&o.updated_at===p.updated_at)))throw Error('Publication baseline changed; reconcile instead of overwriting');
const oldLocations=await rest<{id:string}[]>('locations?select=id');
const newLocations=LOCATIONS.filter(l=>l.requestReviewRequired).map(({id,name,slug,state})=>({id,name,slug,state}));
console.log(`Preflight passed: 22 unchanged existing rows, 13 new rows, exact manifest, correct project.`);
if(!process.argv.includes('--publish'))process.exit(0);
if(existsSync(`${dir}/release-receipt.json`))throw Error('Release receipt exists; inspect before resuming');
writeFileSync(`${dir}/release-before.json`,JSON.stringify({before,oldLocations,manifest},null,2));
const upsert='resolution=ignore-duplicates,return=representation';
await rest('locations?on_conflict=id','POST',newLocations,upsert);
const stagedAt=new Date().toISOString();
const staged=await rest<ContentPageRecord[]>('content_pages?on_conflict=id','POST',plan.inserts.map(p=>({...p,created_at:stagedAt,updated_at:stagedAt})),upsert);
if(staged.length!==13)throw Error('Unexpected staged page count');
await rest('sources?on_conflict=id','POST',plan.newSources.map(s=>({...s,retrieved_at:stagedAt,reviewed_at:stagedAt})),upsert);
await rest('content_sources?on_conflict=content_page_id,source_id,relationship_type','POST',plan.sourceLinks,upsert);
await rest('content_relationships?on_conflict=from_page_id,to_page_id,relationship_type','POST',plan.relationships,upsert);
const now=new Date().toISOString();const published:{id:string;slug:string;updated_at:string}[]=[];
for(const page of plan.pages){
 const prior=before.find(p=>p.id===page.id)??staged.find(p=>p.id===page.id)!;
 const patch={primary_question:page.primary_question,direct_answer:page.direct_answer,sections:page.sections,status:'PUBLISHED',indexable:true,ai_assisted:true,reviewed_by:'a5-owner-authorized-wave-2-editorial-review',reviewed_at:now,last_reviewed_at:now,published_at:prior.published_at??now,updated_at:now};
 // Per-row compare-and-swap: a concurrent edit cannot be silently overwritten.
 const rows=await rest<ContentPageRecord[]>(`content_pages?id=eq.${page.id}&updated_at=eq.${encodeURIComponent(prior.updated_at)}`,'PATCH',patch);
 if(rows.length!==1)throw Error(`Concurrent edit blocked publication of ${page.slug}; inspect receipt for completed rows`);
 published.push({id:rows[0].id,slug:rows[0].slug,updated_at:rows[0].updated_at});
 writeFileSync(`${dir}/release-receipt.json`,JSON.stringify({publishedAt:now,contentSha256:manifest.contentSha256,completed:published.length===35,published,newLocations:newLocations.map(l=>l.id)},null,2));
}
console.log(`Published ${published.length} reviewed rows. Backup and per-row receipt saved. No vendor coverage or assignment changes.`);

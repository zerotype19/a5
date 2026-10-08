/** Exact, owner-authorized North Jersey release. Default is read-only; --publish performs writes. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {LOCATIONS} from '../config/locations.ts';
import {buildNorthPlan} from '../content/north-jersey/plan.ts';
import type {ContentPageRecord} from '../src/lib/authority/types.ts';
const dir='.wrangler/north-jersey';
const plan=JSON.parse(readFileSync(`${dir}/plan.json`,'utf8')) as ReturnType<typeof buildNorthPlan>;
const manifest=JSON.parse(readFileSync('docs/north-jersey/MANIFEST.json','utf8'));
if(createHash('sha256').update(JSON.stringify(plan)).digest('hex')!==manifest.contentSha256)throw Error('Manifest mismatch');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||new URL(url).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co'||!key)throw Error('Expected authorized production project and credentials');
async function rest<T>(path:string,method='GET',body?:unknown,prefer='return=representation'):Promise<T>{
 const r=await fetch(`${url}/rest/v1/${path}`,{method,headers:{apikey:key!,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:prefer},...(body?{body:JSON.stringify(body)}:{})});
 if(!r.ok)throw Error(`${method} ${path}: ${r.status} ${await r.text()}`);return r.json();
}
const ids=plan.pages.map(p=>p.id).join(',');
const before=await rest<ContentPageRecord[]>('content_pages?select=*');
if(before.some(p=>plan.pages.some(n=>n.id===p.id||n.page_type===p.page_type&&n.slug===p.slug)))throw Error('County records already exist; inspect rather than overwrite');
const oldLocations=await rest<{id:string;name:string;slug:string;state:string}[]>('locations?select=id,name,slug,state');
if(oldLocations.length!==9||oldLocations.some(l=>!LOCATIONS.slice(0,9).some(r=>r.id===l.id&&r.slug===l.slug&&r.name===l.name&&r.state===l.state)))throw Error('Unexpected location baseline');
const newLocations=LOCATIONS.slice(9).map(({id,name,slug,state})=>({id,name,slug,state}));
if(newLocations.length!==218||plan.pages.length!==8)throw Error('Unexpected scope');
console.log('Preflight passed: eight new authored pages, 218 new municipality rows, exact manifest and unchanged legacy locations.');
if(!process.argv.includes('--publish'))process.exit(0);
if(existsSync(`${dir}/release-before.json`))throw Error('Prior release attempt exists; inspect before resuming');
writeFileSync(`${dir}/release-before.json`,JSON.stringify({before,oldLocations,manifest},null,2));
const upsert='resolution=ignore-duplicates,return=representation';
const addedLocations=await rest<{id:string}[]>('locations?on_conflict=id','POST',newLocations,upsert);
if(addedLocations.length!==218)throw Error('Unexpected municipality insert count');
const stagedAt=new Date().toISOString();
const staged=await rest<ContentPageRecord[]>('content_pages?on_conflict=id','POST',plan.inserts.map(p=>({...p,created_at:stagedAt,updated_at:stagedAt})),upsert);
if(staged.length!==8)throw Error('Unexpected staged page count');
await rest('sources?on_conflict=id','POST',plan.newSources.map(s=>({...s,retrieved_at:stagedAt,reviewed_at:stagedAt})),upsert);
await rest('content_sources?on_conflict=content_page_id,source_id,relationship_type','POST',plan.sourceLinks,upsert);
await rest('content_relationships?on_conflict=from_page_id,to_page_id,relationship_type','POST',plan.relationships,upsert);
const now=new Date().toISOString();const published:{id:string;slug:string;updated_at:string}[]=[];
for(const page of plan.pages){
 const prior=staged.find(p=>p.id===page.id)!;
 const patch={status:'PUBLISHED',indexable:true,reviewed_by:'a5-owner-authorized-north-jersey-editorial-review',reviewed_at:now,last_reviewed_at:now,published_at:now,updated_at:now};
 const rows=await rest<ContentPageRecord[]>(`content_pages?id=eq.${page.id}&status=eq.DRAFT&updated_at=eq.${encodeURIComponent(prior.updated_at)}`,'PATCH',patch);
 if(rows.length!==1)throw Error(`Concurrent edit blocked publication of ${page.slug}; inspect receipt`);
 published.push({id:rows[0].id,slug:rows[0].slug,updated_at:rows[0].updated_at});
 writeFileSync(`${dir}/release-receipt.json`,JSON.stringify({publishedAt:now,contentSha256:manifest.contentSha256,completed:published.length===8,published,newLocations:addedLocations.map(l=>l.id)},null,2));
}
const verified=await rest<ContentPageRecord[]>(`content_pages?select=*&id=in.(${ids})`);
if(verified.length!==8||verified.some(p=>p.status!=='PUBLISHED'||!p.indexable))throw Error('Publication verification failed');
console.log(`Published ${published.length} reviewed pages and added ${addedLocations.length} request municipalities. No provider coverage changes.`);

/** Read-only state and public route audit; --http after deployment. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {readAllRows} from '../src/lib/admin/read-all.ts';
import {loadWorkQueue} from '../src/lib/admin/work-queue-data.ts';
import {loadEligibleVendors} from '../src/lib/admin/vendors.ts';
import {hasVendorEmail} from '../src/lib/admin/vendor-contact.ts';
import {buildLocalDepthPlan} from '../content/local-depth/plan.ts';
const dir='.wrangler/free-lead-rollout';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const baseline=read(`${dir}/content-before.json`),vendorsBefore=read(`${dir}/email-state-before.json`);
const plan=buildLocalDepthPlan(baseline,read('content/local-depth/towns.json'));
const db=getSupabaseAdmin();
const pages=await readAllRows((from,to)=>db.from('content_pages').select('*').order('id').range(from,to),'pages');
const vendors=await readAllRows((from,to)=>db.from('vendors').select('*').order('id').range(from,to),'vendors');
const links=await readAllRows((from,to)=>db.from('content_sources').select('*').order('content_page_id').order('source_id').range(from,to),'sources');
for(const before of baseline.content_pages){
 const after=pages.find(p=>p.id===before.id)!;assert.ok(after);
 const update=plan.updates.find(p=>p.id===before.id);
 if(!update){assert.deepEqual(after,before);continue;}
 assert.deepEqual(after.sections,update.sections);assert.equal(after.direct_answer,update.direct_answer);assert.equal(after.meta_description,update.meta_description);assert.equal(after.indexable,update.indexable);
 for(const key of Object.keys(before))if(!['sections','direct_answer','meta_description','indexable','reviewed_by','reviewed_at','last_reviewed_at','updated_at'].includes(key))assert.deepEqual(after[key],before[key]);
}
for(const link of plan.sourceLinks)assert.ok(links.some(l=>l.content_page_id===link.content_page_id&&l.source_id===link.source_id));
for(const before of vendorsBefore){
 const after=vendors.find(v=>v.id===before.id)!;assert.ok(after);
 for(const key of Object.keys(before))if(hasVendorEmail(before.email)||!['status','accepting_leads','updated_at'].includes(key))assert.deepEqual(after[key],before[key]);
 if(!hasVendorEmail(after.email)){assert.equal(after.status,'INACTIVE');assert.equal(after.accepting_leads,false);}
}
const eligible=await loadEligibleVendors({serviceId:null,locationId:null});assert.ok(eligible.every(v=>hasVendorEmail(v.email)));
const queue=await loadWorkQueue();assert.ok(queue.vendors.every(v=>v.action==='Find business email'||v.action==='Correct email address'));
const result={checkedAt:new Date().toISOString(),vendors:vendors.length,inactiveWithoutEmail:vendors.filter(v=>!hasVendorEmail(v.email)&&v.status==='INACTIVE').length,emailResearchTasks:queue.vendors.length,requestTasks:queue.requests.length,selectableWithEmail:eligible.length,publishedPages:pages.filter(p=>p.status==='PUBLISHED').length,indexableLocalGuides:plan.updates.filter(p=>p.indexable).length,remainingNoindexProfiles:plan.updates.filter(p=>!p.indexable).length,sourceLinksAdded:plan.sourceLinks.length,httpRoutes:0,sitemapUrls:0};
if(process.argv.includes('--http')){
 const origin='https://www.a5homeservices.com';
 const xml=await fetch(`${origin}/sitemap.xml`).then(r=>r.text());
 const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.equal(urls.length,83);result.sitemapUrls=urls.length;
 const routes=[...new Set([...urls,...plan.manifest.map(p=>origin+p.path)])];let cursor=0;
 await Promise.all(Array.from({length:5},async()=>{while(cursor<routes.length){const url=routes[cursor++];const r=await fetch(url);assert.equal(r.status,200,url);const html=await r.text();
  const p=plan.manifest.find(p=>origin+p.path===url);
  if(p){assert.ok(html.includes(`href="${url}"`),`canonical ${url}`);assert.equal(urls.includes(url),p.indexable);const robots=html.match(/<meta[^>]*name="robots"[^>]*content="([^"]*)"/i)?.[1]??'';assert.equal(robots.includes('noindex'),!p.indexable,`robots ${url}`);const expected=plan.updates.find(row=>row.id===p.id)!;assert.ok(html.includes(expected.primary_location_id!));assert.ok(!html.includes('Provider availability in this area is checked individually'));
  }
  result.httpRoutes++;
 }}));
 const access=await fetch(`${origin}/admin/queue`,{redirect:'manual'});assert.equal(access.status,307);assert.ok(access.headers.get('location')?.includes('/admin/login'));
}
writeFileSync(`${dir}/verification.json`,JSON.stringify(result,null,2));console.log(result);

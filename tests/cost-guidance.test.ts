import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SERVICES} from '../config/services.ts';
import {validateForPublication} from '../src/lib/authority/validate.ts';
import {buildDiscoveryGroups} from '../src/lib/authority/discovery.ts';
import {buildSitemapEntries} from '../src/lib/authority/sitemap.ts';
import type {ContentPageRecord,SourceRecord,ContentSourceLink} from '../src/lib/authority/types.ts';
const plan=JSON.parse(readFileSync('content/cost-guidance/publication.json','utf8')) as {pages:ContentPageRecord[];sources:SourceRecord[];sourceLinks:ContentSourceLink[]};
test('cost library covers every service once, with usable provenance and distinct copy',()=>{
 assert.equal(plan.pages.length,17);
 assert.equal(new Set(plan.pages.map(p=>p.slug)).size,17);
 for(const service of SERVICES){
  const matches=plan.pages.filter(p=>p.primary_service_id===service.id);assert.equal(matches.length,1);
  const page=matches[0];const sources=plan.sources.filter(s=>plan.sourceLinks.some(l=>l.content_page_id===page.id&&l.source_id===s.id));
  assert.deepEqual(validateForPublication({page,sources}),{valid:true});
  assert.ok(new Set(sources.map(s=>new URL(s.url).hostname)).size>=2);
  const costs=page.sections.find(s=>s.type==='COST_ESTIMATES');assert.ok(costs&&costs.type==='COST_ESTIMATES');
  for(const row of costs.rows){assert.ok(sources.some(s=>s.id===row.source_id));assert.ok(row.unit&&row.basis&&row.geography);}
  assert.ok(page.direct_answer?.includes('not New Jersey averages'));
  assert.ok(page.sections.some(s=>s.type==='RICH_TEXT'&&s.items?.length===3));
 }
});
test('published cost pages are discoverable from services and appear in the sitemap',()=>{
 for(const service of SERVICES){
  const page={...plan.pages[0],id:'parent-'+service.id,page_type:'SERVICE',primary_service_id:service.id} as ContentPageRecord;
  const links=buildDiscoveryGroups(page,plan.pages).flatMap(g=>g.links);
  assert.ok(links.some(l=>l.path===`/cost-guides/${service.id}-cost`));
 }
 const urls=buildSitemapEntries(plan.pages).map(e=>e.url);
 assert.ok(urls.includes('https://www.a5homeservices.com/cost-guides'));
 for(const p of plan.pages)assert.ok(urls.includes('https://www.a5homeservices.com/cost-guides/'+p.slug));
 const hidden=buildSitemapEntries(plan.pages.map(p=>({...p,status:'DRAFT',indexable:false})));
 assert.ok(!hidden.some(p=>p.url.includes('/cost-guides/')));
});

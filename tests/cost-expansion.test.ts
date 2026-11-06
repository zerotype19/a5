import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildCostLibraryGroups} from '../src/lib/authority/cost-library.ts';
import {validateForPublication} from '../src/lib/authority/validate.ts';
import {buildDiscoveryGroups} from '../src/lib/authority/discovery.ts';
import {buildSitemapEntries} from '../src/lib/authority/sitemap.ts';
import type {ContentPageRecord,SourceRecord,ContentSourceLink,ContentRelationship} from '../src/lib/authority/types.ts';
const raw=readFileSync('content/cost-expansion/publication.json','utf8');
const plan=JSON.parse(raw) as {pages:ContentPageRecord[];sources:SourceRecord[];sourceLinks:ContentSourceLink[];relationships:ContentRelationship[];patches:{id:string;fields:{sections:ContentPageRecord['sections']}}[]};
const original=JSON.parse(readFileSync('content/cost-guidance/publication.json','utf8')) as {pages:ContentPageRecord[]};
test('multiple published guides remain visible per category, with reference first regardless of input order',()=>{
 const pages=[...plan.pages,...original.pages].reverse();
 const groups=buildCostLibraryGroups(pages);assert.equal(groups.length,16);
 for(const group of groups){assert.equal(group.pages[0].slug,group.service.slug+'-cost');}
 assert.equal(groups.flatMap(g=>g.pages).length,26);
 const hidden=plan.pages.map(p=>({...p,status:'DRAFT' as const,indexable:false}));
 assert.equal(buildCostLibraryGroups([...hidden,...original.pages]).flatMap(g=>g.pages).length,16);
 assert.equal(buildCostLibraryGroups(plan.pages.map(p=>({...p,indexable:false}))).length,0);
});
test('new pages pass publication gates, have sources and incoming editorial relationships',()=>{
 assert.equal(plan.pages.length,12);assert.equal(new Set(plan.pages.map(p=>p.slug)).size,12);
 for(const page of plan.pages){const sources=plan.sources.filter(s=>plan.sourceLinks.some(l=>l.content_page_id===page.id&&l.source_id===s.id));assert.deepEqual(validateForPublication({page,sources}),{valid:true});assert.ok(sources.length);assert.ok(plan.relationships.some(r=>r.to_page_id===page.id));assert.equal(page.primary_location_id,null);}
 assert.equal(createHash('sha256').update(raw).digest('hex'),JSON.parse(readFileSync('docs/cost-expansion/MANIFEST.json','utf8')).sha256);
});
test('existing numeric references and their price review metadata are not patched',()=>{
 assert.equal(plan.patches.length,16);
 for(const patch of plan.patches){assert.deepEqual(Object.keys(patch.fields),['sections']);const before=original.pages.find(p=>p.id===patch.id)!;assert.ok(before);assert.deepEqual(patch.fields.sections.filter(s=>s.type==='COST_ESTIMATES'),before.sections.filter(s=>s.type==='COST_ESTIMATES'));}
});
test('new guides join service discovery and sitemap only when published',()=>{
 const urls=buildSitemapEntries(plan.pages).map(p=>p.url);
 for(const p of plan.pages){const prefix=p.page_type==='GUIDE'?'guides':'cost-guides';assert.ok(urls.includes(`https://www.a5homeservices.com/${prefix}/${p.slug}`));if(p.primary_service_id){const service={...p,id:'service-'+p.primary_service_id,page_type:'SERVICE' as const};assert.ok(buildDiscoveryGroups(service,plan.pages).flatMap(g=>g.links).some(l=>l.path===`/cost-guides/${p.slug}`));}}
 assert.ok(!buildSitemapEntries(plan.pages.map(p=>({...p,status:'DRAFT',indexable:false}))).some(p=>plan.pages.some(q=>p.url.endsWith('/'+q.slug))));
});

import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{validateForPublication}from'../src/lib/authority/validate.ts';import{buildContentPathFromRecord}from'../src/lib/authority/urls.ts';import{MUNICIPALITIES}from'../config/locations.ts';import{SERVICES}from'../config/services.ts';
import type{ContentPageRecord,SourceRecord,ContentSourceLink,ContentRelationship}from'../src/lib/authority/types.ts';
const m=JSON.parse(readFileSync(new URL('../content/seo-readiness/manifest.json',import.meta.url),'utf8')) as {updates:ContentPageRecord[];sources:SourceRecord[];sourceLinks:ContentSourceLink[];relationships:ContentRelationship[]};
test('reviewed local release changes only the fourteen authored pages without permutations',()=>{
 assert.equal(m.updates.length,14);assert.equal(new Set(m.updates.map(p=>p.id)).size,14);assert.equal(new Set(m.updates.map(p=>p.meta_description)).size,14);
 const towns=m.updates.filter(p=>p.page_type==='LOCATION');assert.equal(towns.length,8);assert.equal(new Set(towns.map(p=>MUNICIPALITIES.find(t=>t.id===p.primary_location_id)?.countyId)).size,8);
 for(const p of m.updates){assert.equal(validateForPublication({page:p}).valid,true,p.slug);assert.ok(buildContentPathFromRecord(p));assert.ok(p.sections.some(s=>s.type==='QUESTION_ANSWER'));assert.ok(!JSON.stringify(p.sections).includes('★★★★★'));}
});
test('new town guides have a reviewed government source and valid contextual service links',()=>{
 for(const p of m.updates.filter(p=>p.page_type==='LOCATION')){assert.ok(m.sourceLinks.some(l=>l.content_page_id===p.id&&m.sources.some(s=>s.id===l.source_id&&s.source_type==='GOVERNMENT')));for(const s of p.sections)if(s.type==='RICH_TEXT')for(const item of s.items??[])for(const l of item.links??[])assert.ok(SERVICES.some(service=>l.href===`/services/${service.slug}`));assert.ok(m.relationships.some(r=>r.to_page_id===p.id));}
});

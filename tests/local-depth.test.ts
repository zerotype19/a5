import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildLocalDepthPlan,type LocalTown} from '../content/local-depth/plan.ts';
import {buildMunicipalPlan} from '../content/municipal-expansion/plan.ts';
import {COUNTIES} from '../config/counties.ts';
import {MUNICIPALITIES} from '../config/locations.ts';
import type {SourceRecord} from '../src/lib/authority/types.ts';
const towns=JSON.parse(readFileSync('content/local-depth/towns.json','utf8')) as LocalTown[];
const sources=COUNTIES.map(c=>({id:c.id,url:c.sourceUrl})) as SourceRecord[];
const initial=buildMunicipalPlan({content_pages:[],sources});
const snapshot={content_pages:initial.pages.map(p=>({...p,status:'PUBLISHED' as const})),sources,content_sources:initial.sourceLinks};
test('local depth indexes only eight researched guides, one per county, with resolvable project links',()=>{
 const plan=buildLocalDepthPlan(snapshot,towns);assert.equal(plan.updates.length,226);assert.equal(plan.updates.filter(p=>p.indexable).length,8);
 assert.equal(new Set(towns.map(t=>MUNICIPALITIES.find(l=>l.id===t.location)?.countyId)).size,8);
 assert.equal(plan.sources.length,14);
 for(const town of towns){const page=plan.updates.find(p=>p.primary_location_id===town.location)!;assert.equal(page.direct_answer,town.answer);assert.ok(plan.sourceLinks.some(l=>l.content_page_id===page.id));assert.ok(town.projects.every(p=>['handyman','masonry','landscaping','painting','drywall','tile','plumbing','electrical'].includes(p.service)));assert.ok(!/[\p{Extended_Pictographic}\ufe0f]/u.test(JSON.stringify(page)));}
});
test('copy update preserves existing IDs, slugs and publication history and adds no duplicate sources',()=>{
 const plan=buildLocalDepthPlan(snapshot,towns);
 for(const p of plan.updates){const old=snapshot.content_pages.find(o=>o.id===p.id)!;assert.equal(p.slug,old.slug);assert.equal(p.published_at,old.published_at);assert.equal(p.created_by,old.created_by);assert.ok(!JSON.stringify(p.sections).includes('checks the exact project, location and provider availability'));}
 const again=buildLocalDepthPlan({content_pages:plan.updates,sources:[...sources,...plan.sources],content_sources:[...snapshot.content_sources,...plan.sourceLinks]},towns);assert.equal(again.sources.length,0);assert.equal(again.sourceLinks.length,0);
});

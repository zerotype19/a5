import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import {buildWavePlan,type WaveSnapshot} from '../content/expansion-wave-2/plan.ts';
import {LOCATIONS} from '../config/locations.ts';
import {buildServiceSchema} from '../src/lib/authority/schema.ts';
import {buildSitemapEntries} from '../src/lib/authority/sitemap.ts';
import {intakeContext,requestHref} from '../src/lib/intake/context.ts';
const baseline=()=>JSON.parse(readFileSync(new URL('../content/expansion-wave-2/baseline.fixture.json',import.meta.url),'utf8')) as WaveSnapshot;
describe('Expansion wave 2 publication',()=>{
 it('adds precisely 3 towns, 6 selected local pages and 4 problems alongside 22 revisions',()=>{
  const p=buildWavePlan(baseline());assert.equal(p.updates.length,22);assert.equal(p.inserts.length,13);assert.equal(p.all.length,62);
  for(const [type,count] of [['LOCATION',3],['SERVICE_LOCATION',6],['PROBLEM',4]] as const)assert.equal(p.inserts.filter(p=>p.page_type===type).length,count);
  assert.equal(buildSitemapEntries(p.all.map(p=>({...p,status:'PUBLISHED',indexable:true}))).length,67);
  assert.ok(p.inserts.every(p=>p.status==='DRAFT'&&!p.indexable));
 });
 it('rejects stale edits, duplicate routes, and missing problem/service associations',()=>{
  const s=baseline();s.content_pages[0].updated_at='changed';
  const edited=s.content_pages.find(p=>p.slug==='electrical')!;edited.updated_at='changed';assert.throws(()=>buildWavePlan(s),/Stale baseline/);
  const duplicate=baseline();duplicate.content_pages.push({...duplicate.content_pages[0],id:'duplicate'});assert.throws(()=>buildWavePlan(duplicate),/Duplicate/);
  const missing=baseline();missing.problem_services=missing.problem_services.filter(p=>p.problem_id!=='dripping-faucet');assert.throws(()=>buildWavePlan(missing),/Unknown problem/);
 });
 it('preserves existing URLs, metadata, identity and publication history',()=>{
  const s=baseline(),p=buildWavePlan(s);for(const row of p.updates){const old=s.content_pages.find(o=>o.id===row.id)!;for(const key of ['slug','meta_title','meta_description','created_at','published_at','status','indexable'] as const)assert.equal(row[key],old[key]);}
 });
 it('connects every new page reciprocally and resolves all sources',()=>{
  const p=buildWavePlan(baseline()),ids=new Set(p.all.map(p=>p.id));
  for(const row of p.inserts){assert.ok(p.relationships.some(r=>r.from_page_id===row.id));assert.ok(p.relationships.some(r=>r.to_page_id===row.id));assert.ok(p.sourceLinks.some(l=>l.content_page_id===row.id));}
  for(const r of p.relationships){assert.ok(ids.has(r.from_page_id)&&ids.has(r.to_page_id));assert.ok(p.relationships.some(o=>o.from_page_id===r.to_page_id&&o.to_page_id===r.from_page_id));}
  assert.ok(p.sourceLinks.every(l=>p.sources.some(s=>s.id===l.source_id)));
 });
 it('keeps new town request context and conditional availability explicit',()=>{
  for(const location of LOCATIONS.slice(6)){assert.equal(location.requestReviewRequired,true);const href=requestHref({service:'handyman',location:location.id});assert.ok(href.includes(`location=${location.id}`));assert.equal(intakeContext({location:location.id}).location?.id,location.id);const schema=buildServiceSchema({serviceId:'handyman',locationId:location.id,path:`/${location.id}/handyman`});assert.match(String(schema?.name),/request coordination/);assert.match(String(schema?.serviceType),/availability checked individually/);}
 });
});

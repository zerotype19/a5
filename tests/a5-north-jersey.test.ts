import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import {COUNTIES,countyPath,getCountyBySlug} from '../config/counties.ts';
import {LOCATIONS,MUNICIPALITIES,LOCATION_HUBS,getLocationBySlug,matchesLocationSearch} from '../config/locations.ts';
import {intakeContext,requestHref} from '../src/lib/intake/context.ts';
import {buildNorthPlan,DRAFTS} from '../content/north-jersey/plan.ts';
import {buildContentPathFromRecord} from '../src/lib/authority/urls.ts';
import {buildSitemapEntries,CORE_SITEMAP_ROUTES} from '../src/lib/authority/sitemap.ts';
import {buildBreadcrumbs} from '../src/lib/authority/breadcrumbs.ts';
import type {PublicSnapshot} from '../content/authority-expansion/plan.ts';
const inventory=JSON.parse(readFileSync(new URL('../content/north-jersey/municipality-inventory.json',import.meta.url),'utf8'));
const baseline:PublicSnapshot={content_pages:[],sources:[],content_sources:[],content_relationships:[]};
// Links in authored content must resolve to real baseline service pages.
import {SERVICES} from '../config/services.ts';
const emptyPlan=()=>buildNorthPlan({...baseline,content_pages:SERVICES.map(s=>({id:s.id,slug:s.slug,page_type:'SERVICE',primary_service_id:s.id,primary_location_id:null,primary_problem_id:null})) as PublicSnapshot['content_pages']});
describe('North Jersey regional expansion',()=>{
 it('covers every official municipality once, retaining the historical Chatham ID separately',()=>{
  assert.equal(MUNICIPALITIES.length,226);assert.equal(LOCATIONS.length,227);assert.equal(LOCATION_HUBS.length,9);
  assert.equal(new Set(LOCATIONS.map(l=>l.id)).size,227);
  for(const c of COUNTIES){const actual=MUNICIPALITIES.filter(l=>l.countyId===c.id).map(l=>l.name).sort();const expected=inventory.counties.find((r:{id:string})=>r.id===c.id);assert.deepEqual(actual,[...expected.municipalities].sort());assert.equal(actual.length,c.municipalityCount);}
  assert.deepEqual(LOCATIONS.filter(l=>l.legacyArea).map(l=>l.id),['chatham']);
  assert.equal(getLocationBySlug('chatham-borough')?.hubSlug,'chatham');assert.equal(getLocationBySlug('chatham-township')?.hubSlug,'chatham');
  assert.ok(LOCATIONS.slice(9).every(l=>l.requestReviewRequired));
 });
 it('keeps same-name municipalities and county boundaries unambiguous',()=>{
  for(const county of ['bergen','morris','warren'])assert.equal(getLocationBySlug(`washington-township-${county}`)?.countyId,county);
  assert.equal(getLocationBySlug('north-bergen')?.countyId,'hudson');assert.equal(getLocationBySlug('union-city')?.countyId,'hudson');assert.equal(getLocationBySlug('union-township')?.countyId,'union');
  assert.equal(getLocationBySlug('warren-township'),undefined);assert.equal(getCountyBySlug('somerset-county'),undefined);
 });
 it('validates request context and favors an actual municipality over a conflicting county',()=>{
  assert.equal(requestHref({county:'bergen'}),'/request-service?county=bergen');assert.equal(requestHref({county:'fake'}),'/request-service');
  assert.equal(intakeContext({location:'north-bergen',county:'bergen'}).county?.id,'hudson');
  assert.equal(requestHref({location:'washington-township-warren',county:'bergen'}),'/request-service?location=washington-township-warren');
  assert.ok(matchesLocationSearch(getLocationBySlug('ho-ho-kus')!,'ho ho kus'));assert.ok(matchesLocationSearch(getLocationBySlug('north-bergen')!,'Hudson'));
 });
 it('publishes only eight authored county hubs, with source evidence and distinct planning content',()=>{
  const plan=emptyPlan();assert.equal(plan.pages.length,8);assert.equal(new Set(DRAFTS.map(d=>d.h1)).size,8);assert.equal(new Set(DRAFTS.map(d=>JSON.stringify(d.sections[0]))).size,8);
  for(const p of plan.pages){assert.equal(p.page_type,'CORE');assert.equal(p.primary_location_id,null);assert.match(p.direct_answer!,/check provider availability/);assert.equal(plan.sourceLinks.filter(l=>l.content_page_id===p.id).length,1);assert.equal(plan.relationships.filter(l=>l.from_page_id===p.id).length,SERVICES.length);assert.equal(buildContentPathFromRecord(p),countyPath(getCountyBySlug(p.slug)!));assert.equal(buildBreadcrumbs(p)[1].path,'/home-services');}
  assert.throws(()=>buildNorthPlan({...baseline,content_pages:plan.all}),/Duplicate/);
 });
 it('keeps draft, nonindexable and unrelated CORE records out of the sitemap',()=>{
  const plan=emptyPlan();const draft=plan.pages[0];assert.equal(buildSitemapEntries(plan.pages).length,CORE_SITEMAP_ROUTES.length);
  const published=plan.pages.map(p=>({...p,status:'PUBLISHED' as const,indexable:true}));assert.equal(buildSitemapEntries(published).length,8+CORE_SITEMAP_ROUTES.length);
  assert.equal(buildSitemapEntries([{...draft,status:'PUBLISHED',indexable:false},{...draft,slug:'private-other',status:'PUBLISHED',indexable:true}]).length,CORE_SITEMAP_ROUTES.length);
 });
 it('seeds request geography without altering provider coverage or existing locations',()=>{
  const sql=readFileSync(new URL('../supabase/migrations/20261008000000_a5_north_jersey_locations.sql',import.meta.url),'utf8');
  assert.equal((sql.match(/^ \('/gm)??[]).length,218);assert.match(sql,/on conflict \(id\) do nothing/);assert.doesNotMatch(sql,/\b(update|delete|vendor_locations|vendor_services)\b/i);
 });
});

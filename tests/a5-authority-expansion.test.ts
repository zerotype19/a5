import assert from "node:assert/strict";
import {describe,it} from "node:test";
import {INITIAL_SERVICES as SERVICES} from "../config/services.ts";
import {LOCATIONS} from "../config/locations.ts";
import {buildExpansionPlan, type PublicSnapshot} from "../content/authority-expansion/plan.ts";
import {FIXTURE_SERVICE_PAGE, FIXTURE_LOCATION_PAGE, FIXTURE_SERVICE_LOCATION_PAGE} from "../src/lib/authority/fixtures.ts";
import {buildDiscoveryGroups} from "../src/lib/authority/discovery.ts";
import {buildSitemapEntries,CORE_SITEMAP_ROUTES} from "../src/lib/authority/sitemap.ts";
import {buildServiceSchema} from "../src/lib/authority/schema.ts";
import type {ContentPageRecord} from "../src/lib/authority/types.ts";
const snapshot:PublicSnapshot={content_pages:[...SERVICES.map(s=>({...FIXTURE_SERVICE_PAGE,id:`service-${s.id}`,slug:s.slug,primary_service_id:s.id,status:"PUBLISHED" as const,indexable:true})),...LOCATIONS.map(l=>({...FIXTURE_LOCATION_PAGE,id:`town-${l.id}`,slug:l.slug,primary_location_id:l.id,status:"PUBLISHED" as const,indexable:true})),{...FIXTURE_SERVICE_LOCATION_PAGE,status:"PUBLISHED",indexable:true}],sources:[],content_sources:[],content_relationships:[]};
const plan=buildExpansionPlan(snapshot);
describe("Authority expansion",()=>{
 it("covers every service and town with curated, distinct drafts",()=>{
  assert.equal(plan.pages.length,20);
  assert.equal(plan.manifest.filter(p=>p.action==="insert").length,19);
  assert.deepEqual(new Set(plan.pages.filter(p=>p.page_type==="GUIDE").map(p=>p.primary_service_id)),new Set(SERVICES.map(s=>s.id)));
  assert.deepEqual(new Set(plan.pages.filter(p=>p.page_type==="SERVICE_LOCATION").map(p=>p.primary_location_id)),new Set(LOCATIONS.slice(0,6).map(l=>l.id)));
  assert.equal(new Set(plan.pages.map(p=>p.direct_answer)).size,20);
  assert.equal(new Set(plan.manifest.map(p=>p.path)).size,20);
  assert.ok(plan.pages.every(p=>p.status==="DRAFT"&&!p.indexable&&p.reviewed_by===null));
  assert.equal(buildSitemapEntries(plan.pages).length,CORE_SITEMAP_ROUTES.length);
 });
 it("preserves the existing Madison masonry identity",()=>{
  assert.equal(plan.pages.find(p=>p.primary_service_id==="masonry"&&p.primary_location_id==="madison")?.id,FIXTURE_SERVICE_LOCATION_PAGE.id);
 });
 it("links every new page to its service and every local page to its town in both directions",()=>{
  for(const page of plan.pages){
   for(const hub of [`service-${page.primary_service_id}`,...(page.primary_location_id?[`town-${page.primary_location_id}`]:[])]){
    assert.ok(plan.relationships.some(r=>r.from_page_id===page.id&&r.to_page_id===hub));
    assert.ok(plan.relationships.some(r=>r.to_page_id===page.id&&r.from_page_id===hub));
   }
  }
  const ids=new Set(plan.all.map(p=>p.id));
  assert.ok(plan.relationships.every(r=>ids.has(r.from_page_id)&&ids.has(r.to_page_id)&&r.from_page_id!==r.to_page_id));
 });
 it("excludes draft, noindex, unrelated and self links from discovery",()=>{
  const service=snapshot.content_pages[0];
  const local=plan.pages.find(p=>p.primary_service_id===service.primary_service_id)!;
  const published={...local,status:"PUBLISHED",indexable:true} as ContentPageRecord;
  assert.deepEqual(buildDiscoveryGroups(service,[local]),[]);
  assert.deepEqual(buildDiscoveryGroups(service,[{...published,indexable:false}]),[]);
  assert.deepEqual(buildDiscoveryGroups(service,[service,{...published,primary_service_id:"electrical"}]),[]);
  // General pages cannot claim an editorial town choice is near this visitor.
  assert.deepEqual(buildDiscoveryGroups(service,[published]),[]);
  const townPage={...FIXTURE_LOCATION_PAGE,id:"local-hub",primary_location_id:published.primary_location_id};
  assert.equal(buildDiscoveryGroups(townPage,[published])[0].links.length,1);
  assert.deepEqual(buildDiscoveryGroups(townPage,[{...published,primary_location_id:"unrelated-town"}]),[]);
 });
 it("attaches local sources to every local page and all source ids resolve",()=>{
  assert.ok(plan.pages.filter(p=>p.page_type==="SERVICE_LOCATION").every(p=>plan.sourceLinks.some(l=>l.content_page_id===p.id)));
  assert.ok(plan.sourceLinks.every(l=>plan.sources.some(s=>s.id===l.source_id)&&plan.pages.some(p=>p.id===l.content_page_id)));
 });
 it("uses truthful town-specific service schema without an invented office",()=>{
  const schema=buildServiceSchema({serviceId:"masonry",locationId:"madison",path:"/madison/masonry"});
  assert.deepEqual(schema?.areaServed,{"@type":"Place",name:"Madison, New Jersey"});
  assert.equal(schema?.name,"Masonry introductions in Madison, NJ");
  assert.ok(!JSON.stringify(schema).includes("streetAddress"));
 });
});

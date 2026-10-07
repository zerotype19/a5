import { createHash } from "node:crypto";
import { LOCAL_DRAFTS } from "./local-pages.ts";
import { GUIDE_DRAFTS } from "./guides.ts";
import { EXPANSION_SOURCES } from "./sources.ts";
import { buildContentPathFromRecord } from "../../src/lib/authority/urls.ts";
import { validateForPublication } from "../../src/lib/authority/validate.ts";
import type { ContentPageRecord, ContentRelationship, ContentSourceLink, SourceRecord } from "../../src/lib/authority/types.ts";
export const EXPANSION_DRAFTS = [...LOCAL_DRAFTS, ...GUIDE_DRAFTS];
export type PublicSnapshot = {content_pages:ContentPageRecord[]; sources:SourceRecord[]; content_sources:ContentSourceLink[]; content_relationships:ContentRelationship[]};
const reviewed = "2026-10-07T00:00:00.000Z";
function id(key:string) {
 const h=createHash("sha256").update(`a5-authority-expansion-2026-10:${key}`).digest("hex");
 return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-8${h.slice(17,20)}-${h.slice(20,32)}`;
}
export function buildExpansionPlan(snapshot: PublicSnapshot) {
 const sources:SourceRecord[]=Object.entries(EXPANSION_SOURCES).map(([key,s])=>({id:id(`source:${key}`),title:s.title,url:s.url,publisher:s.publisher,source_type:key==="esfi"?"INDUSTRY":"GOVERNMENT",retrieved_at:reviewed,reviewed_at:null}));
 const sourceByKey = new Map(Object.keys(EXPANSION_SOURCES).map((key,i)=>[key,sources[i]]));
 const pages:ContentPageRecord[]=EXPANSION_DRAFTS.map(draft=>{
  const existing=snapshot.content_pages.find(p=>p.page_type===draft.type && (draft.type==="SERVICE_LOCATION" ? p.primary_service_id===draft.service && p.primary_location_id===draft.town : p.slug===draft.key));
  return {id:existing?.id??id(`page:${draft.key}`),slug:draft.key,page_type:draft.type,title:draft.title,meta_title:draft.title,meta_description:draft.description,h1:draft.title,primary_service_id:draft.service,primary_location_id:draft.town??null,primary_problem_id:null,primary_question:draft.question,direct_answer:draft.answer,sections:[...draft.sections,{type:"RELATED_CONTENT",heading:"Related repair topics and planning"},...(draft.sourceKeys.length?[{type:"SOURCE_LIST" as const,heading:"Sources and local contacts"}]:[]),{type:"CTA",title:"Make the next step easier.",description:"Send A5 your project details and optional photos. We review the request and help coordinate a preferred local vendor. Scope, price and availability are confirmed with the provider.",primaryLabel:"Request service"}],status:"DRAFT",indexable:false,ai_assisted:true,created_by:"a5-authority-expansion",reviewed_by:null,created_at:existing?.created_at??reviewed,updated_at:reviewed,reviewed_at:null,published_at:null,last_reviewed_at:null,cost_methodology:null,cost_geography:null,public_project_approved:false};
 });
 const sourceLinks:ContentSourceLink[]=EXPANSION_DRAFTS.flatMap((draft,i)=>draft.sourceKeys.map(key=>{
  const source=sourceByKey.get(key);if(!source)throw new Error(`Unknown source ${key}`);
  return {content_page_id:pages[i].id,source_id:source.id,relationship_type:"SUPPORTS" as const};
 }));
 const all=[...snapshot.content_pages.filter(p=>!pages.some(n=>n.id===p.id)),...pages];
 const relationships:ContentRelationship[]=[];
 const add=(from:string,to:string,type:ContentRelationship["relationship_type"])=>{if(from!==to&&!relationships.some(r=>r.from_page_id===from&&r.to_page_id===to&&r.relationship_type===type))relationships.push({from_page_id:from,to_page_id:to,relationship_type:type});};
 for(const page of pages){
  const service=all.find(p=>p.page_type==="SERVICE"&&p.primary_service_id===page.primary_service_id);
  if(!service)throw new Error(`Missing service hub ${page.primary_service_id}`);
  add(page.id,service.id,"PARENT");add(service.id,page.id,page.page_type==="GUIDE"?"SUPPORTING_GUIDE":"LOCAL_VARIANT");
  if(page.primary_location_id){const town=all.find(p=>p.page_type==="LOCATION"&&p.primary_location_id===page.primary_location_id);if(!town)throw new Error("Missing town hub");add(page.id,town.id,"PARENT");add(town.id,page.id,"LOCAL_VARIANT");}
  for(const target of all.filter(p=>p.primary_service_id===page.primary_service_id && ["PROBLEM","GUIDE"].includes(p.page_type))){add(page.id,target.id,target.page_type==="GUIDE"?"SUPPORTING_GUIDE":"RELATED");add(target.id,page.id,page.page_type==="SERVICE_LOCATION"?"LOCAL_VARIANT":"SUPPORTING_GUIDE");}
 }
 for(const page of pages){const result=validateForPublication({page,sources:sources.filter(s=>sourceLinks.some(l=>l.content_page_id===page.id&&l.source_id===s.id))});if(!result.valid)throw new Error(JSON.stringify(result.issues));}
 return {pages,sources,sourceLinks,relationships,all,manifest:pages.map(p=>({id:p.id,path:buildContentPathFromRecord(p),type:p.page_type,action:snapshot.content_pages.some(old=>old.id===p.id)?"update":"insert"}))};
}

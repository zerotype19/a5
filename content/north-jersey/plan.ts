import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {COUNTIES} from '../../config/counties.ts';
import {getLocationById,type LocationId} from '../../config/locations.ts';
import {buildContentPathFromRecord} from '../../src/lib/authority/urls.ts';
import {validateForPublication} from '../../src/lib/authority/validate.ts';
import type {ContentPageRecord,ContentSection,ContentRelationship,ContentSourceLink,SourceRecord} from '../../src/lib/authority/types.ts';
import type {PublicSnapshot} from '../authority-expansion/plan.ts';
type Draft={county:string;h1:string;title:string;meta_title:string;meta_description:string;primary_question:string;direct_answer:string;sections:ContentSection[]};
export const DRAFTS=JSON.parse(readFileSync(new URL('./county-drafts.json',import.meta.url),'utf8')) as Draft[];
function id(key:string){const h=createHash('sha256').update(`a5-north-jersey:${key}`).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-8${h.slice(17,20)}-${h.slice(20,32)}`;}
export function buildNorthPlan(snapshot:PublicSnapshot){
 const prepared='2026-10-07T23:00:00.000Z'; // Draft-only placeholder; publication stamps actual time.
 if(DRAFTS.length!==8||new Set(DRAFTS.map(d=>d.county)).size!==8)throw Error('Expected eight authored county drafts');
 const pages:ContentPageRecord[]=DRAFTS.map(d=>{
  const county=COUNTIES.find(c=>c.id===d.county);if(!county)throw Error('Unknown county');
  return {id:id(`page:${county.slug}`),slug:county.slug,page_type:'CORE',title:d.title,h1:d.h1,meta_title:d.meta_title,meta_description:d.meta_description,primary_service_id:null,primary_location_id:null,primary_problem_id:null,primary_question:d.primary_question,direct_answer:d.direct_answer,sections:d.sections,status:'DRAFT',indexable:false,ai_assisted:true,created_by:'a5-north-jersey',reviewed_by:null,created_at:prepared,updated_at:prepared,reviewed_at:null,last_reviewed_at:null,published_at:null,cost_methodology:null,cost_geography:null,public_project_approved:false};
 });
 const all=[...snapshot.content_pages,...pages];
 const paths=all.map(p=>buildContentPathFromRecord(p));if(paths.some(p=>!p)||new Set(paths).size!==paths.length)throw Error('Duplicate or unresolved canonical');
 const sources:SourceRecord[]=[...snapshot.sources];const sourceLinks:ContentSourceLink[]=[];const relationships:ContentRelationship[]=[];
 for(const page of pages){
  const county=COUNTIES.find(c=>c.slug===page.slug)!;
  let source=sources.find(s=>s.url===county.sourceUrl);
  if(!source){source={id:id(`source:${county.sourceUrl}`),url:county.sourceUrl,title:`${county.name} municipality reference`,publisher:county.name,source_type:'GOVERNMENT',retrieved_at:prepared,reviewed_at:prepared};sources.push(source);}
  sourceLinks.push({content_page_id:page.id,source_id:source.id,relationship_type:'BACKGROUND'});
  for(const target of snapshot.content_pages){
   const location=target.primary_location_id?getLocationById(target.primary_location_id as LocationId):undefined;
   if(target.page_type==='SERVICE'||target.page_type==='LOCATION'&&location?.countyId===county.id){
    relationships.push({from_page_id:page.id,to_page_id:target.id,relationship_type:'RELATED'},{from_page_id:target.id,to_page_id:page.id,relationship_type:'RELATED'});
   }
  }
  const validation=validateForPublication({page,sources:[source],otherSlugsForType:all.filter(p=>p.id!==page.id&&p.page_type==='CORE').map(p=>p.slug)});
  if(!validation.valid)throw Error(JSON.stringify(validation.issues));
  if(!page.direct_answer||!page.primary_question||page.sections.filter(s=>s.type==='CTA').length!==1)throw Error(`Incomplete county: ${page.slug}`);
  if(/[\p{Extended_Pictographic}\ufe0f]/u.test(JSON.stringify(page)))throw Error(`Emoji: ${page.slug}`);
  for(const match of JSON.stringify(page.sections).matchAll(/"href":"([^"]+)"/g))if(!paths.includes(match[1])&&!['/services','/home-services','/guides','/request-service'].includes(match[1]))throw Error(`Unresolved link: ${match[1]}`);
 }
 return {pages,inserts:pages,all,sources,sourceLinks,relationships,newSources:sources.filter(s=>!snapshot.sources.some(o=>o.id===s.id)),manifest:pages.map(p=>({id:p.id,slug:p.slug,path:buildContentPathFromRecord(p),type:p.page_type,action:'insert'}))};
}

import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {buildContentPathFromRecord} from '../../src/lib/authority/urls.ts';
import {validateForPublication} from '../../src/lib/authority/validate.ts';
import {CONTENT_SECTION_TYPES, type ContentPageRecord, type ContentSection, type ContentRelationship, type ContentSourceLink, type SourceRecord} from '../../src/lib/authority/types.ts';
import type {PublicSnapshot} from '../authority-expansion/plan.ts';
export type WaveSnapshot = PublicSnapshot & {problems:{id:string;slug:string}[];problem_services:{problem_id:string;service_id:string}[]};
type Citation={url:string;title?:string;publisher?:string;claim?:string};
type Draft={slug:string;page_type:ContentPageRecord['page_type'];service:string|null;location?:string;title:string;h1:string;meta_title:string;meta_description:string;primary_question:string;direct_answer:string;sections:ContentSection[];sources:Citation[]};
type Edit={id:string;slug:string;expected_updated_at:string;patch:Pick<ContentPageRecord,'primary_question'|'direct_answer'|'sections'>};
function read<T>(path:string):T{return JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));}
export const EDITS=read<{pages:Edit[]}>('../../docs/editorial/existing-pages-draft.json').pages;
export const DRAFTS=[...read<Draft[]>('./geo-drafts.json'),...read<{pages:Draft[]}>('../../docs/expansion-wave-2/problem-drafts.json').pages];
const catalog=read<Record<string,{url:string;title:string;publisher:string;source_type:SourceRecord['source_type']}>>('./sources.json');
const serviceSources:Record<string,string[]>={electrical:['esfi','electrical'],plumbing:['water','plumbing'],drywall:['usg','mold'],painting:['lead','mold'],masonry:['brick','pavers'],tile:['tile','mold'],landscaping:['dig'],handyman:['lead']};
function id(key:string){const h=createHash('sha256').update(`a5-wave-2:${key}`).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-8${h.slice(17,20)}-${h.slice(20,32)}`;}
export function buildWavePlan(snapshot:WaveSnapshot){
 const reviewed='2026-10-07T22:00:00.000Z';
 const updates=EDITS.map(e=>{const old=snapshot.content_pages.find(p=>p.id===e.id);if(!old||old.updated_at!==e.expected_updated_at)throw Error(`Stale baseline: ${e.slug}`);return {...old,...e.patch};});
 const inserts:ContentPageRecord[]=DRAFTS.map(d=>{
  const problem=d.page_type==='PROBLEM'?snapshot.problems.find(p=>p.slug===d.slug):null;
  if(d.page_type==='PROBLEM'&&(!problem||!snapshot.problem_services.some(p=>p.problem_id===problem.id&&p.service_id===d.service)))throw Error(`Unknown problem/service: ${d.slug}`);
  return {id:id(`page:${d.slug}`),slug:d.slug,page_type:d.page_type,title:d.title,h1:d.h1,meta_title:d.meta_title,meta_description:d.meta_description,primary_service_id:d.service,primary_location_id:d.location??null,primary_problem_id:problem?.id??null,primary_question:d.primary_question,direct_answer:d.direct_answer,sections:d.sections,status:'DRAFT',indexable:false,ai_assisted:true,created_by:'a5-expansion-wave-2',reviewed_by:null,created_at:reviewed,updated_at:reviewed,reviewed_at:null,last_reviewed_at:null,published_at:null,cost_methodology:null,cost_geography:null,public_project_approved:false};
 });
 const pages=[...updates,...inserts];
 const all=[...snapshot.content_pages.map(p=>updates.find(u=>u.id===p.id)??p),...inserts];
 const paths=all.map(p=>buildContentPathFromRecord(p));
 if(paths.some(p=>!p)||new Set(paths).size!==paths.length)throw Error('Duplicate or unresolved canonical path');
 const sources:SourceRecord[]=[...snapshot.sources];
 const sourceLinks:ContentSourceLink[]=snapshot.content_sources.filter(l=>updates.some(p=>p.id===l.content_page_id));
 function attach(page:ContentPageRecord,c:Citation){
  const known=Object.values(catalog).find(s=>s.url===c.url);let source=sources.find(s=>s.url===c.url);
  if(!source){if(!(c.title??known?.title)||!(c.publisher??known?.publisher))throw Error(`Missing citation metadata: ${c.url}`);source={id:id(`source:${c.url}`),url:c.url,title:(c.title??known?.title)!,publisher:(c.publisher??known?.publisher)!,source_type:known?.source_type??'GOVERNMENT',retrieved_at:reviewed,reviewed_at:reviewed};sources.push(source);}
  if(!sourceLinks.some(s=>s.content_page_id===page.id&&s.source_id===source.id))sourceLinks.push({content_page_id:page.id,source_id:source.id,relationship_type:'BACKGROUND'});
 }
 for(const p of updates)for(const key of serviceSources[p.primary_service_id!]??[])attach(p,catalog[key]);
 for(const p of inserts){const d=DRAFTS.find(d=>d.slug===p.slug)!;for(const c of d.sources)attach(p,c);}
 const relationships:ContentRelationship[]=[];
 function add(from:string,to:string,type:ContentRelationship['relationship_type']){if(from!==to&&!relationships.some(r=>r.from_page_id===from&&r.to_page_id===to&&r.relationship_type===type)&&!snapshot.content_relationships.some(r=>r.from_page_id===from&&r.to_page_id===to&&r.relationship_type===type))relationships.push({from_page_id:from,to_page_id:to,relationship_type:type});}
 for(const page of inserts){
  for(const target of all){
   if(page.id===target.id)continue;
   const sameService=!!page.primary_service_id&&target.primary_service_id===page.primary_service_id;
   const sameTown=!!page.primary_location_id&&target.primary_location_id===page.primary_location_id;
   if(sameService&&target.page_type==='SERVICE'||sameTown&&target.page_type==='LOCATION'){add(page.id,target.id,'PARENT');add(target.id,page.id,page.page_type==='SERVICE_LOCATION'?'LOCAL_VARIANT':'RELATED');}
   else if(page.page_type==='LOCATION'&&sameTown&&target.page_type==='SERVICE_LOCATION'){add(page.id,target.id,'LOCAL_VARIANT');add(target.id,page.id,'PARENT');}
   else if(sameService&&['PROBLEM','GUIDE','SERVICE_LOCATION'].includes(target.page_type)){add(page.id,target.id,'RELATED');add(target.id,page.id,'RELATED');}
  }
 }
 for(const p of pages){
  const result=validateForPublication({page:p,relatedServiceIds:snapshot.problem_services.filter(r=>r.problem_id===p.primary_problem_id).map(r=>r.service_id),sources:sources.filter(s=>sourceLinks.some(l=>l.content_page_id===p.id&&l.source_id===s.id)),otherSlugsForType:all.filter(o=>o.id!==p.id&&o.page_type===p.page_type).map(o=>o.slug)});
  if(!result.valid)throw Error(JSON.stringify(result.issues));
  if(p.sections.some(s=>!CONTENT_SECTION_TYPES.includes(s.type)))throw Error(`Unknown section ${p.slug}`);
  if(p.sections.filter(s=>s.type==='CTA').length!==1)throw Error(`CTA count ${p.slug}`);
  if(/[\p{Extended_Pictographic}\u2190-\u21ff\ufe0f]/u.test(JSON.stringify(p.sections)))throw Error(`Emoji or text arrow ${p.slug}`);
  const serialized=JSON.stringify(p.sections);for(const match of serialized.matchAll(/"href":"([^"]+)"/g)){const path=match[1].split('?')[0];if(!paths.includes(path)&&!['/services','/home-services','/request-service','/guides'].includes(path))throw Error(`Unresolved link ${p.slug}: ${path}`);}
 }
 if(pages.length!==35||inserts.length!==13)throw Error('Wave scope changed');
 return {pages,updates,inserts,all,sources,sourceLinks,relationships,newSources:sources.filter(s=>!snapshot.sources.some(o=>o.id===s.id)),manifest:pages.map(p=>({id:p.id,slug:p.slug,path:buildContentPathFromRecord(p),type:p.page_type,action:updates.includes(p)?'update':'insert'}))};
}

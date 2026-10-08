import {createHash} from 'node:crypto';
import {MUNICIPALITIES} from '../../config/locations.ts';
import {validateForPublication} from '../../src/lib/authority/validate.ts';
import type {ContentPageRecord,ContentSection,SourceRecord,ContentSourceLink} from '../../src/lib/authority/types.ts';
export type LocalTown={location:string;focus:string;description:string;answer:string;heading:string;paragraphs:string[];projects:{title:string;body:string;service:string}[];question:string;response:string;sources:{title:string;url:string;publisher:string;supports:string}[]};
export const LOCAL_DEPTH_REVIEW='2026-10-08T00:00:00.000Z';
const sourceId=(url:string)=>{const h=createHash('sha256').update(`a5-local-depth:${url}`).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-8${h.slice(17,20)}-${h.slice(20,32)}`;};
export function buildLocalDepthPlan(snapshot:{content_pages:ContentPageRecord[];sources:SourceRecord[];content_sources:ContentSourceLink[]},towns:LocalTown[]){
 const updates:ContentPageRecord[]=[],sources:SourceRecord[]=[],sourceLinks:ContentSourceLink[]=[];
 for(const before of snapshot.content_pages.filter(p=>p.created_by==='a5-municipal-directory-2026-10'&&p.status==='PUBLISHED')){
  const town=MUNICIPALITIES.find(l=>l.id===before.primary_location_id)!;if(!town)throw Error('Unresolved town');
  const local=towns.find(t=>t.location===town.id);
  const page={...before,sections:structuredClone(before.sections)};
  page.direct_answer=`Tell us what needs doing at your ${town.name} home. A5 reviews the request and forwards it to a local vendor. The vendor discusses the scope, estimate and schedule with you directly. Sending a request does not book an appointment.`;
  page.meta_description=`Request home services in ${town.name}, New Jersey. Explore eight service categories, describe your project and have A5 forward your request to a local vendor.`;
  page.sections=page.sections.map(section=>{
   if(section.type==='QUESTION_ANSWER')return{...section,items:section.items.map(item=>item.question.startsWith('Can I request any of the eight services')?{...item,answer:'Yes. Choose a listed service and describe the work. A5 reviews and forwards the request to a local vendor, who can discuss the project directly with you. A request is not a booking or a guarantee that the vendor will take the job.'}:item.question==='Can I combine several tasks in one request?'?{...item,answer:'Yes. List your tasks and priority order. A5 forwards the request to a vendor suited to the described work. The vendor can discuss whether the tasks fit one project or need separate trades.'}:item)};
   if(section.type==='CTA')return{...section,description:'Describe the work once. A5 forwards your request to a local vendor for a direct project conversation.'};
   return section;
  });
  if(local){
   page.direct_answer=local.answer;page.meta_description=local.description;page.indexable=true;
   const intro=page.sections.find(s=>s.type==='RICH_TEXT');
   const localSections:ContentSection[]=[
    {type:'RICH_TEXT',heading:local.heading,paragraphs:local.paragraphs},
    {type:'RICH_TEXT',heading:`Prepare your ${town.name} service request`,paragraphs:[],items:local.projects.map(p=>({title:p.title,body:p.body,links:[{label:`Explore ${p.service} projects`,href:`/services/${p.service}`}]}))},
    {type:'QUESTION_ANSWER',items:[
     {question:local.question,answer:local.response},
     {question:'How does A5 pass my request to a vendor?',answer:'Submit your project, location and contact details. A5 reviews the request, selects a vendor and forwards the request. The vendor discusses the work, estimate and scheduling with you; an introduction is not a confirmed appointment.'},
     {question:'What should I include with the first request?',answer:'Describe the result you want, the part of the property involved and any access restrictions. Add clear photos if safe and any existing assessment relevant to the work. You do not need to diagnose the problem yourself.'}
    ]},
    {type:'SOURCE_LIST',heading:'Official local planning resources'},
    {type:'CTA',title:`Start your ${town.name} project`,description:'Tell us what needs doing. A5 will review and forward your request to a local vendor.',primaryLabel:'Request service'}
   ];
   if(intro?.type==='RICH_TEXT')localSections.splice(2,0,{...intro,heading:`Your ${town.name} request location`,paragraphs:[intro.paragraphs[0]]});
   page.sections=localSections;
   for(const ref of local.sources){
    const existing=snapshot.sources.find(s=>s.url===ref.url)||sources.find(s=>s.url===ref.url);
    const source=existing??{id:sourceId(ref.url),title:ref.title,url:ref.url,publisher:ref.publisher,source_type:'GOVERNMENT' as const,retrieved_at:LOCAL_DEPTH_REVIEW,reviewed_at:LOCAL_DEPTH_REVIEW};
    if(!existing)sources.push(source);
    if(!snapshot.content_sources.some(s=>s.source_id===source.id&&s.content_page_id===page.id))sourceLinks.push({content_page_id:page.id,source_id:source.id,relationship_type:'SUPPORTS'});
   }
  }
  page.reviewed_by='Codex / owner-authorized free-lead copy and local editorial review';page.last_reviewed_at=LOCAL_DEPTH_REVIEW;page.reviewed_at=LOCAL_DEPTH_REVIEW;
  if(!validateForPublication({page}).valid)throw Error(`Invalid publication ${page.slug}`);
  updates.push(page);
 }
 if(towns.some(t=>!updates.some(p=>p.primary_location_id===t.location&&p.indexable)))throw Error('Local guide not found in exact municipality cohort');
 return{updates,sources,sourceLinks,manifest:updates.map(p=>({id:p.id,path:`/home-services/${p.slug}`,indexable:p.indexable,review:towns.find(t=>t.location===p.primary_location_id)?.focus??'Free-lead forwarding copy; no indexing change'}))};
}

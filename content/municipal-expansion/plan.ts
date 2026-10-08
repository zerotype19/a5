import {createHash} from 'node:crypto';
import {MUNICIPALITIES, type Location} from '../../config/locations.ts';
import {COUNTIES,countyPath} from '../../config/counties.ts';
import {validateForPublication} from '../../src/lib/authority/validate.ts';
import type {ContentPageRecord,ContentSection,SourceRecord,ContentSourceLink,ContentRelationship} from '../../src/lib/authority/types.ts';
export const MUNICIPAL_COHORT='a5-municipal-directory-2026-10';
const uid=(key:string)=>{const h=createHash('sha256').update(`${MUNICIPAL_COHORT}:${key}`).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-8${h.slice(17,20)}-${h.slice(20,32)}`;};
function locationNote(l:Location){
 const same=MUNICIPALITIES.filter(t=>t.id!==l.id&&t.name===l.name);
 if(same.length)return `${l.name} in ${COUNTIES.find(c=>c.id===l.countyId)!.name} has its own request context. Other municipalities share this name; select the county shown on your property records when requesting help.`;
 if(/^(chatham|chester|rockaway|boonton|mendham|andover|washington)/.test(l.id))return `Use ${l.name} as your municipality when requesting work. Borough, town and township names can identify different local governments, even when mailing addresses look similar. Include your ZIP code and confirm the municipality before arranging a visit.`;
 if(l.id==='union-city')return 'Union City is in Hudson County. Choose this location for a Union City project; Union Township in Union County has a separate request page.';
 if(l.id==='union-township')return 'This page is for Union Township in Union County. Union City in Hudson County has a separate request page. Include the municipality and ZIP code so the project is reviewed in the right area.';
 return `${l.name} is listed in ${COUNTIES.find(c=>c.id===l.countyId)!.name}. Start with this municipality for your request, then include your ZIP code. If a mailing address uses a different place name, add that detail so we can review the location before coordinating a provider.`;
}
export function buildMunicipalPlan(snapshot:{content_pages:ContentPageRecord[];sources:SourceRecord[]}){
 const stamp='2026-10-08T00:00:00.000Z';
 const pages=MUNICIPALITIES.filter(l=>!snapshot.content_pages.some(p=>p.page_type==='LOCATION'&&p.primary_location_id===l.id)).map(l=>{
  const county=COUNTIES.find(c=>c.id===l.countyId)!;
  const sections:ContentSection[]=[
   {type:'RICH_TEXT',heading:`Planning work in ${l.name}`,paragraphs:[locationNote(l),'A useful first request explains the result you want, what is currently damaged or unfinished, and any access constraints. Add one wide photo and one close-up if you can take them safely. You do not need to diagnose the problem or choose a trade before contacting A5.'],links:[{label:`Explore ${county.name}`,href:countyPath(county)}]},
   {type:'RICH_TEXT',heading:'Make the first conversation useful',paragraphs:[],items:[
    {title:'Repairs and small jobs',body:'List each task separately and mark the one that matters most. Include the number of doors, fixtures, walls or other items involved. Mention previous repairs and whether the problem has changed.'},
    {title:'Painting, drywall and tile',body:'Describe the room and affected surface, whether you want a patch or a wider refresh, and any known moisture issue. Share existing material or color details if available. Agree on preparation, cleanup and the finished appearance before work starts.'},
    {title:'Yards, steps and walkways',body:'Photograph the full work area and how a provider would reach it. Identify damaged sections, approximate dimensions and any access restrictions. Ask whether removal, materials and disposal are included in the estimate.'},
    {title:'Plumbing and electrical',body:'Identify the fixture or device and describe what you observed. Mention any existing assessment or prior repair. A5 reviews requests for coordination; this form does not dispatch emergency help.'}
   ]},
   {type:'QUESTION_ANSWER',items:[
    {question:`Can I request any of the eight services in ${l.name}?`,answer:'You can submit a request in any listed category. A5 checks the exact project, location and provider availability before confirming the next step. A service appearing here is not a confirmed appointment or a guarantee of coverage.'},
    {question:'Can I combine several tasks in one request?',answer:'Yes. List the tasks and your priority order. A5 can review whether they fit one provider or need separate trades. The provider confirms scope, timing and the estimate directly with you.'},
    {question:'What if I am not sure which service to choose?',answer:'Choose “Not sure” on the request form and describe the problem in your own words. Useful details include the room or outdoor area, when you noticed it, and what you want repaired or improved.'},
    {question:'What should I check before agreeing to work?',answer:'Ask the proposed provider to explain the scope, materials, schedule, cleanup and exclusions. Confirm relevant credentials and insurance, and ask who will check any project-specific approvals with the appropriate local office. This page does not determine permit requirements.'}
   ]},
   {type:'SOURCE_LIST',heading:'Municipality reference'},
   {type:'CTA',title:`Tell us about your ${l.name} project`,description:'One request starts the review. Provider availability, scope and timing are confirmed individually.',primaryLabel:'Request service'}
  ];
  const page:ContentPageRecord={id:uid(l.id),slug:l.slug,page_type:'LOCATION',title:`Home services in ${l.name}, ${county.name}`,h1:`Home services in ${l.name}.`,meta_title:`${l.name} Home Services | ${county.name}`,meta_description:`Plan repairs and improvements in ${l.name}, ${county.name}, NJ. Explore eight home service categories and request individual provider availability review.`,primary_service_id:null,primary_location_id:l.id,primary_problem_id:null,primary_question:`How do I request home services in ${l.name}, ${county.name}?`,direct_answer:`Start with your project and ZIP code. A5 reviews home service requests in ${l.name}, ${county.name}, and checks for a provider suited to the work. Estimates, scheduling and availability are confirmed after review.`,sections,status:'DRAFT',indexable:false,ai_assisted:true,created_by:MUNICIPAL_COHORT,reviewed_by:null,created_at:stamp,updated_at:stamp,reviewed_at:null,published_at:null,last_reviewed_at:null,cost_methodology:null,cost_geography:null,public_project_approved:false};
  if(!validateForPublication({page}).valid)throw Error(`Invalid page ${l.id}`);
  return page;
 });
 const sourceLinks:ContentSourceLink[]=[],relationships:ContentRelationship[]=[];
 for(const page of pages){const l=MUNICIPALITIES.find(l=>l.id===page.primary_location_id)!;const county=COUNTIES.find(c=>c.id===l.countyId)!;const source=snapshot.sources.find(s=>s.url===county.sourceUrl);if(!source)throw Error(`Missing official county source ${county.id}`);sourceLinks.push({content_page_id:page.id,source_id:source.id,relationship_type:'BACKGROUND'});
 for(const target of snapshot.content_pages.filter(p=>p.status==='PUBLISHED'&&(p.page_type==='SERVICE'||p.page_type==='CORE'&&p.slug===county.slug))){relationships.push({from_page_id:page.id,to_page_id:target.id,relationship_type:'RELATED'});}}
 return{pages,sourceLinks,relationships,manifest:pages.map(p=>({id:p.id,path:`/home-services/${p.slug}`,location:p.primary_location_id,indexable:false,intent:'Municipality service selection and project preparation',review:'Directory utility approved; distinct local search content/demand review pending'}))};
}

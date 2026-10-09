/** Compile the authored copy; no database writes. The private snapshot supplies immutable IDs and source evidence. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getLocationById,type LocationId} from '../config/locations.ts';
import {getCountyById,countyPath} from '../config/counties.ts';
import {getServiceById,type ServiceId} from '../config/services.ts';
import {validateForPublication} from '../src/lib/authority/validate.ts';
import type {ContentPageRecord,ContentSection} from '../src/lib/authority/types.ts';
const before=JSON.parse(readFileSync('.wrangler/customer-copy/before.json','utf8')) as {content_pages:ContentPageRecord[]};
const notes=JSON.parse(readFileSync('content/customer-copy/local-notes.json','utf8')) as Record<string,string>;
const rows=readFileSync('content/customer-copy/edits.tsv','utf8').trim().split('\n').map(line=>line.split('|'));
if(rows.length!==221||new Set(rows.map(r=>r[0])).size!==221||rows.some(r=>r.length!==5||r.slice(2).some(s=>s.split('~').length!==2)))throw Error('Invalid authored rows');
const workflow:ContentSection={type:'RICH_TEXT',heading:'What happens after you request service?',paragraphs:['A5 is a home services network. We review your request and look for an independent professional whose services and coverage match your project. When a suitable connection is available, we forward your request. You discuss the scope, price and schedule directly with that professional. Sending a request does not book work or guarantee a response or availability.']};
const custom:Record<string,string[]>={'hanover-township':['masonry','landscaping','handyman'],livingston:['handyman','drywall','painting'],summit:['plumbing','tile','drywall']};
const updates=before.content_pages.filter(p=>p.page_type==='LOCATION').sort((a,b)=>a.slug.localeCompare(b.slug)).map(old=>{
 const p=structuredClone(old);const location=getLocationById(p.primary_location_id as LocationId)!;const county=getCountyById(location.countyId)!;
 const row=rows.find(r=>r[0]===p.slug);
 if(row){
  const oldItems=p.sections.flatMap(s=>s.type==='RICH_TEXT'?s.items??[]:[]);
  const projects=row.slice(2).map((value,i)=>{const[title,body]=value.split('~');const links=custom[p.slug]? [{href:`/services/${custom[p.slug][i]}`,label:`Explore ${getServiceById(custom[p.slug][i] as ServiceId)!.name.toLowerCase()} projects`}]:oldItems[i].links;return{title,body,links:links?.map(link=>({...link,label:`Explore ${getServiceById(link.href.split('/').at(-1) as ServiceId)!.name.toLowerCase().replace('&','and')}`}))};});
  p.primary_question='What would you like to get done?';p.direct_answer=row[1];
  const serviceNames=projects.map(x=>getServiceById(x.links![0].href.split('/').at(-1) as ServiceId)!.name.toLowerCase());
  p.meta_description=`${location.name} home projects: ${serviceNames.join(', ')} and more. Tell A5 what needs attention and connect with an independent local professional.`;
  if((p.meta_description?.length??0)>170)p.meta_description=`Need ${serviceNames.join(', ')} in ${location.name}? Send A5 your project request and connect with a local professional.`;
  const sections:ContentSection[]=[{type:'RICH_TEXT',heading:'A few ways to get started',paragraphs:[],items:projects},workflow];
  if(notes[p.slug])sections.push({type:'RICH_TEXT',heading:'A useful local detail',paragraphs:[notes[p.slug]]});
  // Keep the dedicated local service pages linked from the three original expansion towns.
  for(const s of old.sections)if(s.type==='RICH_TEXT'&&s.heading?.startsWith('Explore projects in '))sections.push(s);
  sections.push({type:'RICH_TEXT',heading:'Your project location',paragraphs:[`Request help for your home in ${location.name}, ${county.name}. Include the property’s ZIP code and any access details that will help the professional plan a visit.`],links:[{href:countyPath(county),label:`More areas in ${county.name}`}]});
  if(notes[p.slug]&&!/^(hanover-township|boonton|boonton-township|chatham-borough|chatham-township|andover-borough|andover-township|washington-township-bergen|washington-township-morris)$/.test(p.slug))sections.push({type:'SOURCE_LIST',heading:'Local reference for this project detail'});
  sections.push({type:'CTA',title:`What can we help with in ${location.name}?`,description:'Describe the job, add photos if helpful and tell us your preferred timing. We’ll review your request and help you take the next step.',primaryLabel:'Request service'});
  p.sections=sections;
 }else{
  if(p.created_by!=='cursor-authority-draft')throw Error('Missing town '+p.slug);
  // These six already use a customer voice. Remove the obsolete eight-service list in favor of the shared sixteen-service cards.
  p.sections=p.sections.filter(s=>!(s.type==='RICH_TEXT'&&s.heading==='What can we help with?')).map(s=>{
   if(s.type==='RICH_TEXT'&&s.heading==='How A5 works')return workflow;
   if(s.type==='CTA')return{...s,description:'Describe the job, add photos if helpful and tell us your preferred timing. A5 reviews your request and looks for a suitable independent professional. You discuss the work, price and schedule directly.'};
   if(s.type==='RICH_TEXT'&&s.heading==='Masonry in Madison')return{...s,paragraphs:['For brick steps, mortar or paver repairs, our Madison masonry page explains what to photograph and how to describe the job.']};
   if(s.type==='RICH_TEXT'&&s.heading==='Morris Township or Morristown?')return{...s,paragraphs:['Morris Township and Morristown are different municipalities, even though a Morris Township home may use Morristown in its mailing address. Include the work property’s municipality and ZIP code if known; you can still describe the project if you are unsure.']};
   if(s.type==='RICH_TEXT'&&s.heading==='Morristown or Morris Township?')return{...s,paragraphs:['A Morristown mailing address does not always mean the property is in the Town of Morristown. A5 accepts requests for both municipalities. Include the work property’s municipality and ZIP code if known.']};
   if(s.type==='RICH_TEXT'&&!s.heading&&p.slug==='morris-township')return{...s,paragraphs:['A5 helps Morris Township homeowners connect with independent professionals for repairs, maintenance and home projects. You do not need to know the trade before describing the problem.']};
   return s;
  });
 }
 p.reviewed_by='Codex / owner-authorized customer-first copy review';
 if(!validateForPublication({page:p}).valid)throw Error('Publication invalid '+p.slug);
 return p;
});
if(updates.length!==227)throw Error('Wrong location count');
const raw=JSON.stringify({version:1,updates},null,2)+'\n';writeFileSync('content/customer-copy/manifest.json',raw);
const hash=createHash('sha256').update(raw).digest('hex');
writeFileSync('docs/customer-copy/manifest-digest.json',JSON.stringify({sha256:hash,pages:227,rewritten:221,lightlyEdited:6,localNotes:Object.keys(notes).length},null,2)+'\n');
console.log({pages:updates.length,sha256:hash,metadataMax:Math.max(...updates.map(p=>(p.meta_description?.length??0)))});

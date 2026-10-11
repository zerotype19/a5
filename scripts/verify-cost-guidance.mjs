import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const plan=JSON.parse(readFileSync('content/cost-guidance/publication.json','utf8'));
const preview=process.argv.includes('--preview');
const origin=preview?'http://localhost:43123':(process.env.A5_AUDIT_ORIGIN||'https://www.a5homeservices.com');
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#x27;',"'").replaceAll('&quot;','"');
const results=[];
for(const page of plan.pages){
 const path=(preview?'/authority-preview/':'/cost-guides/')+page.slug;
 const response=await fetch(origin+path,{signal:AbortSignal.timeout(30000)});const html=await response.text();
 const errors=[];if(response.status!==200)errors.push('HTTP '+response.status);
 if((html.match(/<h1\b/g)||[]).length!==1)errors.push('H1 count');
 if(!decode(html).includes(page.h1))errors.push('Missing heading');
 if(!preview){
  const head=html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]??'';
  if(!head.includes(`href="https://www.a5homeservices.com/cost-guides/${page.slug}"`))errors.push('Canonical');
  if(!/name="robots" content="index, follow"/.test(head))errors.push('Robots');
 }
 for(const section of page.sections)if(section.type==='COST_ESTIMATES')for(const row of section.rows){
  if(!html.includes(row.amount))errors.push('Missing amount '+row.label);
  const source=plan.sources.find(s=>s.id===row.source_id);if(!source||!html.includes(source.url))errors.push('Missing source '+row.label);
 }
 if(page.primary_service_id&&!html.includes('/request-service?service='+page.primary_service_id))errors.push('Missing prefilled CTA');
 results.push({path,status:response.status,errors});
}
const hub=await fetch(origin+(preview?'/authority-preview/hub':'/cost-guides'));const hubhtml=await hub.text();
const missing=plan.pages.filter(p=>!hubhtml.includes('/cost-guides/'+p.slug));
results.push({path:'/cost-guides',status:hub.status,errors:missing.map(p=>'Missing '+p.slug)});
if(!preview){const sitemap=await (await fetch(origin+'/sitemap.xml')).text();for(const p of plan.pages)if(!sitemap.includes('/cost-guides/'+p.slug))results.push({path:p.slug,errors:['Missing sitemap entry']});}
mkdirSync('.wrangler/cost-guidance',{recursive:true});writeFileSync(`.wrangler/cost-guidance/${preview?'preview':'live'}-checks.json`,JSON.stringify({at:new Date().toISOString(),origin,results},null,2));
console.log({checked:results.length,errors:results.filter(r=>r.errors.length)});if(results.some(r=>r.errors.length))process.exitCode=1;

/** Canonical production or development-preview render check for every edited location. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SERVICES} from '../config/services.ts';
const local=process.argv.includes('--local');const origin=local?'http://localhost:43123':'https://www.a5homeservices.com';
const raw=readFileSync('content/customer-copy/manifest.json','utf8');const {updates}=JSON.parse(raw);
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#x27;',"'").replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
const plain=s=>decode(s.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<style\b[\s\S]*?<\/style>/gi,'').replace(/<!--.*?-->/g,'').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
const sitemap=local?'':await(await fetch(origin+'/sitemap.xml')).text();const rows=[];let next=0;
await Promise.all(Array.from({length:local?3:5},async()=>{while(next<updates.length){const page=updates[next++],path=(local?'/authority-preview/':'/home-services/')+page.slug;const errors=[];
 try{
 const r=await fetch(origin+path,{signal:AbortSignal.timeout(60000)});const rawHtml=await r.text(),html=decode(rawHtml),text=plain(rawHtml);const head=html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]??'';
 if(r.status!==200)errors.push('HTTP '+r.status);
 if((html.match(/<h1[\s>]/g)||[]).length!==1||!text.includes(page.h1))errors.push('H1');
 if(!text.includes(page.direct_answer.replace(/\s+/g,' ')))errors.push('Direct answer');
 for(const section of page.sections){if(section.type==='RICH_TEXT'){for(const value of [...section.paragraphs,...(section.items??[]).flatMap(i=>[i.title,i.body])])if(!text.includes(value.replace(/\s+/g,' ')))errors.push('Missing copy '+value.slice(0,45));}}
 for(const s of SERVICES)if(!html.includes(`/request-service?service=${s.id}&location=${page.primary_location_id}`))errors.push('Service CTA '+s.id);
 if(html.indexOf('id="direct-answer-heading"')>html.indexOf('id="town-services"'))errors.push('Intro after service grid');
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)errors.push('Duplicate anchor');
 for(const m of html.matchAll(/href="#(section-\d+)"/g))if(!ids.includes(m[1]))errors.push('Broken outline '+m[1]);
 if(!local){
 if(!head.includes(`rel="canonical" href="${origin+path}"`))errors.push('Canonical');
 if(!head.includes('name="robots" content="index, follow"'))errors.push('Robots');
 const description=head.match(/name="description" content="([^"]*)"/)?.[1];if(description!==page.meta_description)errors.push('Metadata copy');
 if(!sitemap.includes(`<loc>${origin+path}</loc>`))errors.push('Sitemap');
 }
 const json=[...rawHtml.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];if(!json.length)errors.push('Missing JSON-LD');for(const m of json)JSON.parse(m[1]);
 rows.push({path,status:r.status,errors});
 }catch(e){rows.push({path,errors:[String(e)]});}
}}));
rows.sort((a,b)=>a.path.localeCompare(b.path));const evidence={checkedAt:new Date().toISOString(),sha256:createHash('sha256').update(raw).digest('hex'),origin,count:rows.length,sitemapCount:local?null:(sitemap.match(/<loc>/g)||[]).length,errors:rows.filter(r=>r.errors.length),rows};
writeFileSync(`docs/customer-copy/${local?'preview':'live'}-verification.json`,JSON.stringify(evidence,null,2)+'\n');console.log({count:rows.length,errors:evidence.errors,sitemapCount:evidence.sitemapCount});if(evidence.errors.length)process.exitCode=1;

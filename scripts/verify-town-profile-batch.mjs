/** Verify one published batch and persist the evidence required by the next batch. */
import{readFileSync,writeFileSync}from'node:fs';
import{SERVICES}from'../config/services.ts';
const batch=process.argv[2];if(!/^\d{2}$/.test(batch??''))throw Error('Use a two-digit batch number');
const m=JSON.parse(readFileSync(`content/town-profiles/batch-${batch}.manifest.json`,'utf8'));const origin='https://www.a5homeservices.com';const sitemap=await(await fetch(origin+'/sitemap.xml')).text();const rows=[];const errors=[];
for(const p of m.updates){const path='/home-services/'+p.slug,r=await fetch(origin+path,{signal:AbortSignal.timeout(30000)}),html=(await r.text()).replaceAll('&amp;','&');const head=html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]??'';const problems=[];
 if(r.status!==200)problems.push('HTTP '+r.status);if((html.match(/<h1[\s>]/g)||[]).length!==1)problems.push('H1');if(!head.includes(`rel="canonical" href="${origin+path}"`))problems.push('canonical');if(!head.includes('name="robots" content="index, follow"'))problems.push('robots');if((head.match(/name="description"/g)||[]).length!==1)problems.push('description');if(!sitemap.includes(`<loc>${origin+path}</loc>`))problems.push('sitemap');
 for(const section of p.sections)if(section.type==='RICH_TEXT'&&section.heading&&!html.includes(section.heading))problems.push('missing heading '+section.heading);
 for(const service of SERVICES.map(s=>s.id))if(!html.includes(`/request-service?service=${service}&location=${p.primary_location_id}`))problems.push('missing contextual CTA '+service);
 for(const s of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))try{JSON.parse(s[1]);}catch{problems.push('invalid structured data');}
 rows.push({path,status:r.status,errors:problems});if(problems.length)errors.push({path,problems});}
const evidence={batch,checkedAt:new Date().toISOString(),count:rows.length,sitemapCount:(sitemap.match(/<loc>/g)||[]).length,errors,rows};writeFileSync(`docs/town-profiles/batch-${batch}.live.json`,JSON.stringify(evidence,null,2)+'\n');console.log({batch,count:rows.length,sitemap:evidence.sitemapCount,errors});if(errors.length)process.exitCode=1;

/** Verify the HTTP document head, not just tags anywhere in streamed HTML. */
import {writeFileSync,mkdirSync} from 'node:fs';
const origin=process.env.A5_AUDIT_ORIGIN||'https://www.a5homeservices.com';
const paths=['/','/services','/services/handyman','/services/plumbing/running-toilet','/guides/prepare-for-a-plumbing-service-visit','/home-services/florham-park','/madison/masonry','/request-service','/home-services/newton'];
const agents={browser:'Mozilla/5.0 Chrome/131.0 Safari/537.36',googlebot:'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'};
const results=[];
for(const path of paths){let prior;for(const [agent,ua] of Object.entries(agents)){
 const start=Date.now(),r=await fetch(origin+path,{headers:{'User-Agent':ua},signal:AbortSignal.timeout(30000)}),html=await r.text();
 const head=html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]??'';
 const tags=[...html.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(m=>m[0]);
 const selected=tags.filter(t=>/name="(?:description|robots)"|rel="canonical"|property="og:(?:title|description|image)"/.test(t));
 const one=(pattern)=>tags.filter(t=>pattern.test(t));
 const errors=[];if(r.status!==200)errors.push('HTTP '+r.status);
 for(const [name,pattern]of [['description',/name="description"/],['canonical',/rel="canonical"/],['robots',/name="robots"/],['og:title',/property="og:title"/],['og:description',/property="og:description"/],['og:image',/property="og:image"/]]){const matches=one(pattern);if(matches.length!==1)errors.push(name+' count '+matches.length);if(matches.some(t=>!head.includes(t)))errors.push(name+' outside head');}
 const canonical=one(/rel="canonical"/)[0]?.match(/href="([^"]+)"/)?.[1];if(!canonical||new URL(canonical).href!==new URL(path,'https://www.a5homeservices.com').href)errors.push('wrong canonical');
 if(path==='/request-service'&&!one(/name="robots"/)[0]?.includes('noindex'))errors.push('intake lost noindex');
 if(path!=='/request-service'&&path!=='/home-services/newton'&&one(/name="robots"/)[0]?.includes('noindex'))errors.push('unexpected noindex');
 const signature=selected.sort().join('');if(prior&&signature!==prior)errors.push('user agents differ');prior=signature;
 results.push({path,agent,status:r.status,ms:Date.now()-start,tags:selected,errors});
}}
mkdirSync('.wrangler/seo-readiness',{recursive:true});const file=origin.includes('localhost')?'metadata-local.json':'metadata-live.json';writeFileSync('.wrangler/seo-readiness/'+file,JSON.stringify({origin,at:new Date().toISOString(),results},null,2));console.log(JSON.stringify({origin,checked:results.length,errors:results.filter(r=>r.errors.length)},null,2));if(results.some(r=>r.errors.length))process.exitCode=1;

/** Read-only production reconciliation. Private raw evidence stays in ignored .wrangler. */
import {mkdirSync,writeFileSync} from 'node:fs';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {readAllRows} from '../src/lib/admin/read-all.ts';
import {loadVendors} from '../src/lib/admin/vendors.ts';
import {hasVendorEmail} from '../src/lib/admin/vendor-contact.ts';
import {MUNICIPALITIES} from '../config/locations.ts';
import {SERVICES} from '../config/services.ts';
import {buildContentPathFromRecord} from '../src/lib/authority/urls.ts';
const db=getSupabaseAdmin();
const [vendors,pages]=await Promise.all([loadVendors(),readAllRows((a,b)=>db.from('content_pages').select('*').order('id').range(a,b),'pages')]);
const real=vendors.filter(v=>v.businessName!=='A5 Owner Email Test');
const towns=MUNICIPALITIES.map(t=>({id:t.id,name:t.name,county:t.countyId,services:SERVICES.map(s=>({id:s.id,imported:real.filter(v=>v.locationIds.includes(t.id)&&v.serviceIds.includes(s.id)).length,assignable:real.filter(v=>hasVendorEmail(v.email)&&v.locationIds.includes(t.id)&&v.serviceIds.includes(s.id)).length}))}));
const published=pages.filter(p=>p.status==='PUBLISHED');
const origin='https://www.a5homeservices.com';
const records=published.map(p=>({path:buildContentPathFromRecord(p),indexable:p.indexable,type:p.page_type}));
const result={checkedAt:new Date().toISOString(),municipalities:towns.length,counties:new Set(towns.map(t=>t.county)).size,vendors:real.length,excludedFixtures:vendors.filter(v=>!real.includes(v)).map(v=>v.businessName),statuses:Object.fromEntries([...new Set(real.map(v=>v.status))].map(s=>[s,real.filter(v=>v.status===s).length])),usableEmail:real.filter(v=>hasVendorEmail(v.email)).length,missingEmailInactive:real.filter(v=>!hasVendorEmail(v.email)&&v.status==='INACTIVE').length,serviceMappings:real.reduce((n,v)=>n+v.serviceIds.length,0),townMappings:real.reduce((n,v)=>n+v.locationIds.length,0),pairs:towns.flatMap(t=>t.services).length,pairsWithEmail:towns.flatMap(t=>t.services).filter(s=>s.assignable>0).length,minimumAssignable:Math.min(...towns.flatMap(t=>t.services).map(s=>s.assignable)),gaps:towns.filter(t=>t.services.some(s=>!s.assignable)),published:published.length,indexable:published.filter(p=>p.indexable).length,http:[] as {path:string;status:number;issues:string[]}[],brokenLinks:[] as string[]};
mkdirSync('.wrangler/network',{recursive:true});writeFileSync('.wrangler/network/production-snapshot.json',JSON.stringify({vendors,pages,towns},null,2),{mode:0o600});
if(process.argv.includes('--http')){
 const xml=await fetch(origin+'/sitemap.xml').then(r=>r.text());const sitemap=new Set([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]));
 const paths=[...new Set([...records.map(r=>r.path).filter(Boolean),'/','/services','/home-services','/guides','/about','/vendors/join','/request-service','/privacy','/terms'])] as string[];
 const links=new Set<string>();let cursor=0;
 await Promise.all(Array.from({length:5},async()=>{while(cursor<paths.length){const path=paths[cursor++];const response=await fetch(origin+path);const html=await response.text();const issues:string[]=[];if(response.status!==200)issues.push('HTTP');const record=records.find(r=>r.path===path);if(record){const robots=html.match(/<meta[^>]*name="robots"[^>]*content="([^"]*)"/i)?.[1]??'';if(robots.includes('noindex')===record.indexable)issues.push('robots');if(sitemap.has(origin+path)!==record.indexable)issues.push('sitemap');if(!html.includes(`rel="canonical" href="${origin+path}"`))issues.push('canonical');if(!html.includes('/request-service'))issues.push('CTA');}for(const match of html.matchAll(/href="([^"#]+)"/g)){try{const u=new URL(match[1].replaceAll('&amp;','&'),origin);if(u.origin===origin&&!u.pathname.startsWith('/_next/')&&!u.pathname.startsWith('/api/'))links.add(u.pathname);}catch{}}result.http.push({path,status:response.status,issues});}}));
 const extra=[...links].filter(p=>!paths.includes(p));cursor=0;await Promise.all(Array.from({length:4},async()=>{while(cursor<extra.length){const p=extra[cursor++];const r=await fetch(origin+p);if(r.status>=400)result.brokenLinks.push(p);}}));
}
writeFileSync('.wrangler/network/production-audit.json',JSON.stringify(result,null,2));console.log({...result,http:result.http.length,httpIssues:result.http.filter(r=>r.issues.length)});

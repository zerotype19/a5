/** Read-only data QA. Raw evidence stays private; public report contains aggregate counts and business IDs only. */
import {mkdirSync,writeFileSync} from 'node:fs';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {readAllRows} from '../src/lib/admin/read-all.ts';
import {SERVICES} from '../config/services.ts';
import {LOCATIONS} from '../config/locations.ts';
import {hasVendorEmail} from '../src/lib/admin/vendor-contact.ts';
const db=getSupabaseAdmin();
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong project');
const orders:Record<string,string[]>={services:['id'],locations:['id'],vendors:['id'],vendor_services:['vendor_id','service_id'],vendor_locations:['vendor_id','location_id'],problems:['id'],problem_services:['problem_id','service_id'],content_pages:['id'],sources:['id'],content_sources:['content_page_id','source_id','relationship_type'],content_relationships:['from_page_id','to_page_id','relationship_type']};
// Dynamic read-only audit spans heterogeneous table schemas. Field checks below validate each usage.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data:Record<string,Record<string,any>[]>={};
for(const [table,keys] of Object.entries(orders))data[table]=await readAllRows((a,b)=>{let q=db.from(table).select('*');for(const key of keys)q=q.order(key);return q.range(a,b);},table);
// Operational relationship audit deliberately excludes names, contact details, descriptions and tokens.
const operationalColumns:Record<string,string>={customers:'id',leads:'id,customer_id,service_id,location_id,status,service_selection_status',lead_assignments:'id,lead_id,vendor_id,status',project_photos:'id,lead_id',lead_status_events:'id,lead_id',lead_notes:'id,lead_id'};
for(const [table,columns] of Object.entries(operationalColumns))data[table]=await readAllRows((a,b)=>db.from(table).select(columns).order('id').range(a,b),table);
const issues:{table:string;id:string;issue:string}[]=[];
const flag=(table:string,id:string,issue:string)=>issues.push({table,id,issue});
const ids=(table:string)=>new Set(data[table].map(r=>r.id));
const url=(s:unknown)=>{try{const u=new URL(String(s));return ['https:','http:'].includes(u.protocol)&&!!u.hostname&&!/\s/.test(String(s));}catch{return false;}};
for(const [table,registry] of [['services',SERVICES],['locations',LOCATIONS]] as const){for(const r of data[table]){const match=registry.find(x=>x.id===r.id);if(!match)flag(table,r.id,'unknown registry id');else for(const k of ['slug','name'] as const)if(r[k]!==match[k])flag(table,r.id,'registry mismatch '+k);}for(const r of registry)if(!ids(table).has(r.id))flag(table,r.id,'registry row missing');}
for(const v of data.vendors){if(v.business_name==='A5 Owner Email Test'){if(v.email||v.status!=='INACTIVE'||v.accepting_leads)flag('vendors',v.id,'fixture not quarantined');continue;}const id=v.id;if(v.email&&!hasVendorEmail(v.email))flag('vendors',id,'invalid email');if(v.email&&/example\.|test@|name@email|johnsmith/i.test(v.email))flag('vendors',id,'placeholder email');if(!hasVendorEmail(v.email)&&v.status!=='INACTIVE')flag('vendors',id,'missing-email vendor not inactive');for(const field of ['website','source_url'])if(v[field]&&!url(v[field]))flag('vendors',id,'invalid '+field);if(v.phone&&!/^\+?[\d\s().-]+(?:\s*(?:x|ext\.?)\s*\d+)?$/i.test(v.phone))flag('vendors',id,'phone contains unexpected text');if(v.contact_name&&(/@|https?:|\b(?:county|service area)\b/i.test(v.contact_name)))flag('vendors',id,'contact name may contain wrong field data');if(!data.vendor_services.some(r=>r.vendor_id===id))flag('vendors',id,'no service mapping');if(!data.vendor_locations.some(r=>r.vendor_id===id))flag('vendors',id,'no location mapping');if(!v.source_url)flag('vendors',id,'missing source URL');}
const fks:Record<string,Record<string,string>>={leads:{customer_id:'customers',service_id:'services',location_id:'locations'},lead_assignments:{lead_id:'leads',vendor_id:'vendors'},project_photos:{lead_id:'leads'},lead_status_events:{lead_id:'leads'},lead_notes:{lead_id:'leads'},vendor_services:{vendor_id:'vendors',service_id:'services'},vendor_locations:{vendor_id:'vendors',location_id:'locations'},problem_services:{problem_id:'problems',service_id:'services'},content_sources:{content_page_id:'content_pages',source_id:'sources'},content_relationships:{from_page_id:'content_pages',to_page_id:'content_pages'},content_pages:{primary_service_id:'services',primary_location_id:'locations',primary_problem_id:'problems'}};
for(const [table,fields] of Object.entries(fks))for(const r of data[table])for(const [field,target] of Object.entries(fields))if(r[field]&&!ids(target).has(r[field]))flag(table,r.id??JSON.stringify(r),'orphan '+field);
for(const [table,keys] of Object.entries(orders)){const seen=new Set();for(const r of data[table]){const key=keys.map(k=>r[k]).join('|');if(seen.has(key))flag(table,key,'duplicate key');seen.add(key);}}
for(const p of data.content_pages){if(p.indexable&&p.status!=='PUBLISHED')flag('content_pages',p.id,'indexable unpublished');if(!Array.isArray(p.sections))flag('content_pages',p.id,'sections not array');if(p.page_type==='PROBLEM'&&!data.problem_services.some(r=>r.problem_id===p.primary_problem_id&&r.service_id===p.primary_service_id))flag('content_pages',p.id,'problem/service mismatch');}
for(const lead of data.leads){
 if(lead.service_selection_status==='SELECTED'&&!lead.service_id)flag('leads',lead.id,'selected service missing');
 const open=data.lead_assignments.filter(a=>a.lead_id===lead.id&&['ASSIGNED','ACCEPTED'].includes(a.status));
 if(open.length>1)flag('leads',lead.id,'multiple open assignments');
}
const duplicateCandidates=[];for(const field of ['email','website','phone','business_name']){const groups=new Map<string,string[]>();for(const v of data.vendors){const key=String(v[field]??'').toLowerCase().replace(/\/$/,'').trim();if(!key)continue;groups.set(key,[...(groups.get(key)??[]),v.id]);}for(const [value,vendorIds] of groups)if(vendorIds.length>1)duplicateCandidates.push({field,value,vendorIds});}
const report={checkedAt:new Date().toISOString(),counts:Object.fromEntries(Object.entries(data).map(([k,v])=>[k,v.length])),issues,duplicateCandidates};
mkdirSync('.wrangler/growth-wave-3',{recursive:true});writeFileSync('.wrangler/growth-wave-3/data-snapshot.json',JSON.stringify(data),{mode:0o600});writeFileSync('.wrangler/growth-wave-3/data-qa.json',JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify(report,null,2));

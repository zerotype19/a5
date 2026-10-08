/** Owner-authorized reviewed vendor batch. Dry-run by default; receipts prevent blind retries. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getSupabaseAdmin } from '../src/lib/supabase/admin.ts';
import { readAllRows } from '../src/lib/admin/read-all.ts';
import { parseVendorCandidateCsv, VENDOR_IMPORT_COLUMNS } from '../src/lib/admin/vendor-import.ts';
import { LOCATION_RECORDS } from '../config/municipalities.ts';
const db=getSupabaseAdmin();
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co') throw Error('Wrong project');
const raw=readFileSync('docs/vendor-depth/CANDIDATES.json','utf8');
const candidates=JSON.parse(raw) as {business_name:string;website:string;email:string;phone:string;services:string[];counties:string[];source_urls:string[];observed_date:string;notes:string}[];
const snapshot:Record<string,Record<string,unknown>[]>={};
for(const table of ['vendors','vendor_services','vendor_locations']) snapshot[table]=await readAllRows((from,to)=>db.from(table).select('*').order(table==='vendors'?'id':'vendor_id').order(table==='vendor_services'?'service_id':table==='vendor_locations'?'location_id':'id').range(from,to),table);
const norm=(v:unknown)=>String(v??'').toLowerCase().replace(/[^a-z0-9]/g,'');
const domain=(v:unknown)=>v?new URL(String(v)).hostname.toLowerCase().replace(/^www\./,''):'';
const phone=(v:unknown)=>String(v??'').replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'');
const seen=[...snapshot.vendors];
const skipped:{business:string;existing:unknown}[]=[];
const rows:string[][]=[];
for(const c of candidates){
 const duplicate=seen.find(v=>norm(v.business_name)===norm(c.business_name)||domain(v.website)===domain(c.website)||(v.email&&String(v.email).toLowerCase()===c.email.toLowerCase())||(phone(v.phone)&&phone(v.phone)===phone(c.phone)));
 if(duplicate){skipped.push({business:c.business_name,existing:duplicate.business_name});continue;}
 const locations=LOCATION_RECORDS.filter(l=>!l.legacyArea&&c.counties.includes(l.countyId)).map(l=>l.id);
 if(!c.email||!locations.length||!c.services.length||!c.source_urls.length)throw Error('Incomplete reviewed candidate: '+c.business_name);
 rows.push([c.business_name,'',c.phone,c.email,c.website,c.services.join(';'),locations.join(';'),'Public website: vendor depth',c.source_urls[0],`Public sources reviewed ${c.observed_date}. Advertised coverage; credentials and availability unconfirmed. ${c.notes} Sources: ${c.source_urls.join(' ')}`]);
 seen.push({...c});
}
const csv=[VENDOR_IMPORT_COLUMNS,...rows].map(r=>r.map(v=>'"'+v.replaceAll('"','""')+'"').join(',')).join('\n')+'\n';
const parsed=parseVendorCandidateCsv(csv,snapshot.vendors.map(v=>String(v.business_name)));
if(parsed.fileError||parsed.rejected.length)throw Error(JSON.stringify({error:parsed.fileError,rejected:parsed.rejected}));
console.log({preflight:'passed',newVendors:parsed.rows.length,skipped});
if(!process.argv.includes('--apply'))process.exit(0);
const key=createHash('sha256').update(raw).digest('hex').slice(0,16);
const prefix=`.wrangler/vendor-depth/release-${key}`;
if(existsSync(prefix+'-before.json')||existsSync(prefix+'-receipt.json'))throw Error('Prior evidence exists; inspect before resuming');
const admins=await db.from('admin_users').select('user_id').eq('active',true);
if(admins.error||admins.data?.length!==1)throw Error('Resolve authorized operator');
writeFileSync(prefix+'-before.json',JSON.stringify(snapshot),{flag:'wx',mode:0o600});
writeFileSync(prefix+'-import.csv',csv,{flag:'wx',mode:0o600});
const receipt:{started:string;completed?:string;intent:unknown;writes:unknown[];skipped:unknown[]}={started:new Date().toISOString(),intent:null,writes:[],skipped};
const save=()=>writeFileSync(prefix+'-receipt.json',JSON.stringify(receipt,null,2),{mode:0o600});
for(const r of parsed.rows){
 receipt.intent={business:r.businessName};save();
 const {data,error}=await db.rpc('admin_upsert_vendor',{p_vendor_id:null,p_business_name:r.businessName,p_contact_name:null,p_phone:r.phone||null,p_email:r.email,p_website:r.website,p_source:r.source,p_source_url:r.sourceUrl,p_discovery_notes:r.discoveryNotes,p_status:'DISCOVERED',p_accepting_leads:false,p_registration_number:null,p_license_number:null,p_insurance_verified:false,p_credentials_notes:null,p_service_ids:r.serviceIds,p_location_ids:r.locationIds,p_actor_user_id:admins.data[0].user_id});
 const result=Array.isArray(data)?data[0]:data;
 if(error||!result?.ok||!result.vendor_id)throw Error(`Write uncertain/failed ${r.businessName}: ${error?.code??result?.error_code}`);
 receipt.writes.push({business:r.businessName,id:result.vendor_id,services:r.serviceIds,locations:r.locationIds.length});receipt.intent=null;save();
}
receipt.completed=new Date().toISOString();save();
console.log({completed:receipt.completed,inserted:receipt.writes.length,receipt:prefix+'-receipt.json'});

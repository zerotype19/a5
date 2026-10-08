/** Read-only manifest/CSV preparation. Never writes to production. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MUNICIPALITIES} from '../config/locations.ts';
import {SERVICES} from '../config/services.ts';
import {COUNTIES} from '../config/counties.ts';
import {parseVendorCandidateCsv,VENDOR_IMPORT_COLUMNS} from '../src/lib/admin/vendor-import.ts';
import {buildMunicipalPlan} from '../content/municipal-expansion/plan.ts';
const dir='.wrangler/municipal-expansion';
const baseline=JSON.parse(readFileSync(`${dir}/baseline.json`,'utf8'));
const ledger=JSON.parse(readFileSync('docs/municipal-expansion/VENDOR-CANDIDATES.json','utf8'));
const candidates=ledger.candidates as {business_name:string;website:string;phone:string;email:string;services:string[];county_ids:string[];municipality_ids:string[];source_urls:string[];evidence_summary:string;observed_date:string}[];
const name=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const domain=(s:string|null)=>s?new URL(s).hostname.replace(/^www\./,''):'';
const phone=(s:string|null)=>(s??'').replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'');
const seen=baseline.vendors.map((v:{business_name:string;website:string;phone:string;email:string})=>v);
const cell=(s:string)=>'"'+(/^[=+@-]/.test(s)?"'"+s:s).replace(/"/g,'""')+'"';
const lines=[VENDOR_IMPORT_COLUMNS.join(',')];
for(const v of candidates){
 const duplicate=seen.find((o:{business_name:string;website:string;phone:string;email:string})=>name(o.business_name)===name(v.business_name)||domain(o.website)===domain(v.website)||phone(o.phone)&&phone(o.phone)===phone(v.phone)||o.email&&v.email&&o.email.toLowerCase()===v.email.toLowerCase());
 if(duplicate)throw Error(`Review duplicate: ${v.business_name} / ${duplicate.business_name}`);
 if(v.county_ids.some(id=>!COUNTIES.some(c=>c.id===id)))throw Error(`Unknown county ${v.business_name}`);
 const locations=[...new Set([...MUNICIPALITIES.filter(l=>v.county_ids.includes(l.countyId)).map(l=>l.id),...v.municipality_ids])];
 const notes=`Batch ${ledger.batch}. Public source reviewed ${v.observed_date}. A5 availability unconfirmed. Candidate mappings reflect advertised reach, not verified coverage. ${v.evidence_summary} Sources: ${v.source_urls.join(' ')}`;
 lines.push([v.business_name,'',v.phone,v.email,v.website,v.services.join(';'),locations.join(';'),'Public website: North Jersey expansion',v.source_urls[0],notes].map(cell).join(','));seen.push(v);
}
const csv=lines.join('\n')+'\n';const parsed=parseVendorCandidateCsv(csv,baseline.vendors.map((v:{business_name:string})=>v.business_name));
if(parsed.fileError||parsed.rejected.length)throw Error(JSON.stringify(parsed));
writeFileSync('docs/municipal-expansion/VENDOR-IMPORT.csv',csv);
const plan=buildMunicipalPlan(baseline);writeFileSync(`${dir}/content-plan.json`,JSON.stringify(plan,null,2));
const hash=(value:unknown)=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
writeFileSync('docs/municipal-expansion/CONTENT-MANIFEST.json',JSON.stringify({sha256:hash(plan),pages:plan.manifest},null,2)+'\n');
const matrix=MUNICIPALITIES.flatMap(l=>SERVICES.map(s=>{const matches=parsed.rows.filter(v=>v.locationIds.includes(l.id)&&v.serviceIds.includes(s.id));return{county:l.countyId,municipality:l.id,service:s.id,new_candidates:matches.length,email_candidates:matches.filter(v=>v.email).length,confirmed_primary:0,confirmed_backup:0,next_action:'Kevin: confirm scope, territory, capacity, credentials and recipient',candidate_names:matches.map(v=>v.businessName).join(';')};}));
writeFileSync('docs/municipal-expansion/COVERAGE-MATRIX.csv',[Object.keys(matrix[0]).join(','),...matrix.map(row=>Object.values(row).map(v=>cell(String(v))).join(','))].join('\n')+'\n');
writeFileSync(`${dir}/vendor-plan.json`,JSON.stringify(parsed.rows,null,2));
writeFileSync('docs/municipal-expansion/VENDOR-MANIFEST.json',JSON.stringify({batch:ledger.batch,sha256:hash(csv),candidates:parsed.rows.length,newServiceMappings:parsed.rows.reduce((n,v)=>n+v.serviceIds.length,0),newLocationMappings:parsed.rows.reduce((n,v)=>n+v.locationIds.length,0),pairs:matrix.length,pairsWithTwoCandidates:matrix.filter(r=>r.new_candidates>=2).length,pairsWithTwoEmailCandidates:matrix.filter(r=>r.email_candidates>=2).length,confirmedPairs:0,missingEmail:parsed.rows.filter(v=>!v.email).map(v=>v.businessName)},null,2)+'\n');
console.log({pages:plan.pages.length,vendors:parsed.rows.length,pairs:matrix.length,atLeastTwo:matrix.filter(r=>r.new_candidates>=2).length,atLeastTwoEmail:matrix.filter(r=>r.email_candidates>=2).length});

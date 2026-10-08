/** Current read-only editorial baseline and assignment eligibility, paginated. */
import{readFileSync,writeFileSync,mkdirSync,existsSync}from'node:fs';
import{getSupabaseAdmin}from'../src/lib/supabase/admin.ts';
import{readAllRows}from'../src/lib/admin/read-all.ts';
import{hasVendorEmail}from'../src/lib/admin/vendor-contact.ts';
import{SERVICES}from'../config/services.ts';
const batch=process.argv[2];if(!/^\d{2}$/.test(batch??''))throw Error('Use a two-digit batch number');
const expected=(JSON.parse(readFileSync('docs/town-profiles/QUEUE.json','utf8')).towns as {id:string;batch:number}[]).filter(t=>t.batch===Number(batch));if(!expected.length)throw Error('Unknown batch');
const dir=`.wrangler/town-profiles/batch-${batch}`;mkdirSync(dir,{recursive:true});if(existsSync(`${dir}/before.json`))throw Error('Baseline already exists; inspect before replacing');
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong database');
const db=getSupabaseAdmin();const data:Record<string,Record<string,unknown>[]>={};
for(const[table,columns]of Object.entries({content_pages:['id'],sources:['id'],content_sources:['content_page_id','source_id','relationship_type'],content_relationships:['from_page_id','to_page_id','relationship_type'],vendors:['id'],vendor_services:['vendor_id','service_id'],vendor_locations:['vendor_id','location_id']}))data[table]=await readAllRows((a,b)=>{let q=db.from(table).select('*');for(const c of columns)q=q.order(c);return q.range(a,b);},table);
writeFileSync(`${dir}/before.json`,JSON.stringify(data),{mode:0o600,flag:'wx'});
const eligible=data.vendors.filter(v=>v.status==='ACTIVE'&&hasVendorEmail(v.email as string|null));const matrix=expected.flatMap(t=>SERVICES.map(s=>({town:t.id,service:s.id,activeEmailedMappedVendors:eligible.filter(v=>data.vendor_services.some(x=>x.vendor_id===v.id&&x.service_id===s.id)&&data.vendor_locations.some(x=>x.vendor_id===v.id&&x.location_id===t.id)).length})));
writeFileSync(`docs/town-profiles/batch-${batch}.coverage.json`,JSON.stringify({checkedAt:new Date().toISOString(),meaning:'Recorded active/email/category/municipality eligibility only; not specialist coverage, availability, delivery or fulfillment.',matrix},null,2)+'\n');console.log({batch,towns:expected.length,combinations:matrix.length,minimum:Math.min(...matrix.map(r=>r.activeEmailedMappedVendors))});

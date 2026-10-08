/** Owner-authorized fixture archival and activation. Review dry run first; private receipts preserve history. */
import{mkdirSync,readFileSync,writeFileSync,existsSync}from'node:fs';
import{getSupabaseAdmin}from'../src/lib/supabase/admin.ts';
import{hasVendorEmail}from'../src/lib/admin/vendor-contact.ts';
const db=getSupabaseAdmin();if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong project');
const prior=JSON.parse(readFileSync('.wrangler/operations-fixes/before.json','utf8'));
const testVendor='cf4076bd-7cfa-4355-9360-c706999fc168';
// Exact known fixture identities, never broad customer/email matching on current production data.
const names=new Set(['Smoke Tester One','Smoke NotSure','Smoke FarZip','Storage Gate Tester','Admin Gate Lead','Synthetic Launchcheck','A5 Owner Test','A5 INTERNAL RELEASE TEST — no customer follow-up']);
const leadIds=prior.leads.filter((l:{id:string;customer_id:string})=>names.has(prior.customers.find((c:{id:string})=>c.id===l.customer_id)?.full_name)||l.id==='88ad79b7-f0b9-40a9-b306-c23cc3552c6c').map((l:{id:string})=>l.id);
const realVendors=prior.vendors.filter((v:{id:string;email:string;status:string;accepting_leads:boolean})=>v.id!==testVendor&&hasVendorEmail(v.email)&&(v.status!=='ACTIVE'||!v.accepting_leads));
console.log({archiveLeads:leadIds.length,archiveVendors:1,activateVendors:realVendors.length,keepFrontSteps:true});
if(!process.argv.includes('--apply'))process.exit(0);
const path='.wrangler/operations-fixes/cleanup-receipt.json';if(existsSync(path))throw Error('Prior run exists; inspect before resuming');mkdirSync('.wrangler/operations-fixes',{recursive:true});
const receipt:{intent:string|null;done:string[]}={intent:null,done:[]};const save=()=>writeFileSync(path,JSON.stringify(receipt,null,2),{mode:0o600});save();
for(const id of leadIds){receipt.intent=`archive-lead:${id}`;save();const before=prior.leads.find((l:{id:string})=>l.id===id);const{data,error}=await db.from('leads').update({archived_at:new Date().toISOString()}).eq('id',id).eq('updated_at',before.updated_at).select('id');if(error||data.length!==1)throw Error('Lead changed; inspect');const assignments=await db.from('lead_assignments').select('id').eq('lead_id',id);if(assignments.error)throw assignments.error;const ids=assignments.data.map(a=>a.id);if(ids.length){for(const table of ['assignment_capabilities','network_invitations']){const r=await db.from(table).update({revoked_at:new Date().toISOString()}).in('assignment_id',ids).is('revoked_at',null);if(r.error)throw r.error;}}const outbox=await db.from('lead_notification_outbox').update({status:'FAILED',last_error:'archived_test_request'}).eq('lead_id',id).eq('status','PENDING');if(outbox.error)throw outbox.error;receipt.done.push(receipt.intent);receipt.intent=null;save();}
receipt.intent=`archive-vendor:${testVendor}`;save();const v=await db.from('vendors').update({archived_at:new Date().toISOString(),status:'INACTIVE',accepting_leads:false}).eq('id',testVendor).eq('updated_at',prior.vendors.find((v:{id:string})=>v.id===testVendor).updated_at).select('id');if(v.error||v.data.length!==1)throw Error('Test vendor changed');receipt.done.push(receipt.intent);receipt.intent=null;save();
for(const vendor of realVendors){receipt.intent=`activate:${vendor.id}`;save();const r=await db.from('vendors').update({status:'ACTIVE',accepting_leads:true}).eq('id',vendor.id).eq('updated_at',vendor.updated_at).eq('email',vendor.email).select('id');if(r.error||r.data.length!==1)throw Error('Vendor changed; inspect');receipt.done.push(receipt.intent);receipt.intent=null;save();}
console.log({completed:receipt.done.length});

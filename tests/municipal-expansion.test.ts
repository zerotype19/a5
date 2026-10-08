import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildMunicipalPlan} from '../content/municipal-expansion/plan.ts';
import {MUNICIPALITIES} from '../config/locations.ts';
import {COUNTIES} from '../config/counties.ts';
import {parseVendorCandidateCsv} from '../src/lib/admin/vendor-import.ts';
import {readAllRows} from '../src/lib/admin/read-all.ts';
import {buildLeadWorkQueue,buildVendorWorkQueue,type QueueLead,type QueueAssignment} from '../src/lib/admin/work-queue.ts';
import {isSitemapEligible} from '../src/lib/authority/validate.ts';
import type {SourceRecord} from '../src/lib/authority/types.ts';
const sources=COUNTIES.map(c=>({id:c.id,url:c.sourceUrl})) as SourceRecord[];
test('municipal profiles cover each exact municipality without service permutations or indexing',()=>{
 const plan=buildMunicipalPlan({content_pages:[],sources});assert.equal(plan.pages.length,226);assert.equal(new Set(plan.pages.map(p=>p.slug)).size,226);
 for(const page of plan.pages){assert.equal(page.page_type,'LOCATION');assert.equal(page.indexable,false);assert.equal(isSitemapEligible({...page,status:'PUBLISHED'}),false);assert.ok(MUNICIPALITIES.some(l=>l.id===page.primary_location_id));assert.ok(plan.sourceLinks.some(l=>l.content_page_id===page.id));assert.ok(!/[\p{Extended_Pictographic}\ufe0f]/u.test(JSON.stringify(page)));}
 const rerun=buildMunicipalPlan({content_pages:plan.pages,sources});assert.equal(rerun.pages.length,0);
});
test('reviewed import uses resolvable IDs and no placeholder recipients',()=>{const csv=readFileSync('docs/municipal-expansion/VENDOR-IMPORT.csv','utf8');const parsed=parseVendorCandidateCsv(csv);assert.equal(parsed.fileError,null);assert.deepEqual(parsed.rejected,[]);assert.equal(parsed.rows.length,23);for(const v of parsed.rows){assert.ok(v.locationIds.length);assert.ok(!/example\.com|mysite\.com|name@email\.com/.test(v.email));assert.ok(v.discoveryNotes.includes('A5 availability unconfirmed'));}});
test('admin pagination retains records beyond the API row limit and surfaces later errors',async()=>{const rows=Array.from({length:1251},(_,id)=>({id}));const result=await readAllRows(async(from,to)=>({data:rows.slice(from,to+1),error:null}),'test');assert.equal(result.length,1251);assert.equal(result[1250].id,1250);await assert.rejects(readAllRows(async(from,to)=>from?{data:null,error:{code:'failure'}}:{data:rows.slice(from,to+1),error:null},'test'),/test:failure/);});
const now='2026-10-08T00:00:00Z';
const lead=(id:string,status:QueueLead['status'],follow_up_at?:string):QueueLead=>({id,status,created_at:'2026-10-01T00:00:00Z',follow_up_at});
const assigned=(id:string,notice:string|null):QueueAssignment=>({id:`a-${id}`,lead_id:id,status:'ASSIGNED',assigned_at:'2026-10-07T00:00:00Z',notification_status:notice,notification_sent_at:'2026-10-07T00:00:00Z'});
test('work queue prioritizes failures and due work; closed leads never return',()=>{const rows=buildLeadWorkQueue([lead('new','NEW'),lead('failed','ASSIGNED'),lead('due','CONTACTED','2026-10-07T00:00:00Z'),lead('closed','WON'),lead('qualified','QUALIFIED')],[assigned('failed','FAILED')],[],now);assert.equal(rows[0].id,'failed');assert.equal(rows[1].id,'due');assert.ok(!rows.some(r=>r.id==='closed'));assert.equal(rows.find(r=>r.id==='qualified')?.action,'Assign a vendor');});
test('sent email without a current capability needs renewal; future follow-up is not due',()=>{const rows=buildLeadWorkQueue([lead('expired','ASSIGNED'),lead('waiting','ASSIGNED'),lead('future','ESTIMATE','2026-11-01T00:00:00Z')],[assigned('expired','SENT'),assigned('waiting','SENT')],[{assignment_id:'a-expired',expires_at:'2026-10-07T00:00:00Z',revoked_at:null},{assignment_id:'a-waiting',expires_at:'2026-10-09T00:00:00Z',revoked_at:null}],now);assert.equal(rows.find(r=>r.id==='expired')?.action,'Renew vendor handoff');assert.equal(rows.find(r=>r.id==='waiting')?.action,'Awaiting vendor response');assert.equal(rows.find(r=>r.id==='future')?.action,'Scheduled follow-up');});
test('vendor tasks do not mistake discovery for readiness',()=>{const rows=buildVendorWorkQueue([{id:'a',businessName:'Candidate',status:'DISCOVERED',email:'business@test.com',phone:null},{id:'b',businessName:'Missing contact',status:'ACTIVE',email:null,phone:'2015550100'},{id:'c',businessName:'Paused',status:'PAUSED',email:null,phone:null}]);assert.equal(rows.length,2);assert.equal(rows.find(r=>r.id==='vendor-a')?.action,'Confirm vendor readiness');});
test('enriched public contact stays in confirmation queue until its pending note is resolved',()=>{
 const vendor={id:'pending',businessName:'Public contact',status:'ACTIVE',email:'contact@example.test',phone:null,discoveryNotes:'Contact confirmation pending. Public source only.'};
 assert.equal(buildVendorWorkQueue([vendor])[0]?.action,'Confirm vendor email');
 assert.equal(buildVendorWorkQueue([{...vendor,discoveryNotes:'Recipient confirmed by Kevin on October 8.'}]).length,0);
});

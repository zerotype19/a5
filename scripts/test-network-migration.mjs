/** Real migrations in a disposable local PostgreSQL cluster. Never sends email. */
import {execFileSync,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const bin=execFileSync('pg_config',['--bindir'],{encoding:'utf8'}).trim(),dir=mkdtempSync(join(tmpdir(),'a5-network-db-')),port='54392';
const args=['-h',dir,'-p',port,'-d','postgres','-v','ON_ERROR_STOP=1','-At'];
const sql=text=>execFileSync(join(bin,'psql'),args,{input:text,encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
const concurrent=async text=>(await promisify(execFile)(join(bin,'psql'),[...args,'-c',text])).stdout.trim();
const expect=(query,value)=>assert.equal(sql(query),value,query);
const denied=query=>assert.throws(()=>sql(query));
const actor='00000000-0000-4000-8000-000000000001';
let number=10;const id=()=>`00000000-0000-4000-8000-${String(number++).padStart(12,'0')}`;
const hash=()=>String(number++).padStart(64,'0');
try{
 execFileSync(join(bin,'initdb'),['-D',join(dir,'data'),'-A','trust','--no-locale'],{stdio:'ignore'});
 execFileSync(join(bin,'pg_ctl'),['-D',join(dir,'data'),'-l',join(dir,'log'),'-o',`-k ${dir} -p ${port} -c listen_addresses=''`,'start'],{stdio:'ignore'});
 sql(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${actor}');create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid,bucket_id text);`);
 const root=new URL('../supabase/migrations/',import.meta.url);
 for(const file of readdirSync(root).filter(f=>f.endsWith('.sql')).sort()){
  try{sql(readFileSync(new URL(file,root),'utf8'));}catch(e){console.error('Migration failed:',file,e.stderr?.toString());throw e;}
 }
 sql(`insert into admin_users(user_id)values('${actor}');`);

 const submitKey=id();const request=(key,version='2026-10-08')=>`select * from submit_network_request('${key}','Homeowner','5555555555','home@example.invalid','email','SELECTED','handyman','07932','Test request','EXPLORING','/services/handyman',null,'${version}');`;
 denied(request(id(),'wrong'));const submitted=sql(request(submitKey));expect(request(submitKey),submitted);expect(`select network_consent_version from leads where submission_key='${submitKey}'`,'2026-10-08');expect(`select count(*) from lead_notification_outbox where lead_id=(select id from leads where submission_key='${submitKey}')`,'1');
 const customer=id(),vendor=id();
 sql(`insert into customers(id,full_name,email)values('${customer}','Homeowner fixture','home@example.invalid');insert into vendors(id,business_name,email)values('${vendor}','Provider fixture','vendor@example.invalid');`);
 const service=sql('select id from services limit 1'),town=sql('select id from locations limit 1');
 const fixture=(consent=true)=>{const lead=id(),assignment=id();sql(`insert into leads(id,customer_id,service_id,location_id,status,project_description,network_consent_version)values('${lead}','${customer}','${service}','${town}','ASSIGNED','Private description with home@example.invalid',${consent?"'2026-10-08'":'null'});insert into lead_assignments(id,lead_id,vendor_id,status,assigned_by)values('${assignment}','${lead}','${vendor}','ASSIGNED','${actor}');`);return{lead,assignment};};
 const offer=(a,h)=>`select * from network_prepare_vendor_notification('${a}','${h}',now()+interval '72 hours','${actor}',24);`;
 const respond=(h,action='ACCEPT')=>`select * from network_respond_to_assignment('${h}','${action}');`;
 const release=(a,permission=false)=>`select * from admin_release_network_assignment('${a}','${actor}','Homeowner requested another introduction in test',${permission});`;
 const prepare=(a,party,h,retry=false)=>`select * from admin_prepare_network_checkin('${a}','${party}','${h}','${actor}',${retry});`;
 const report=(h,contact='YES',outcome='COMPLETED',rating='5')=>`select * from submit_network_report('${h}','${contact}','${outcome}',${rating},'Original private feedback',false);`;
 const main=fixture(),token=hash();assert.ok(sql(offer(main.assignment,token)).startsWith('t||'));
 expect(release(main.assignment),'f|offer_still_open');
 // No vendor progress invite before acceptance; an offered request cannot receive completed-work stars.
 expect(prepare(main.assignment,'VENDOR',hash()),'f|acceptance_required||');
 const early=hash();assert.ok(sql(prepare(main.assignment,'HOMEOWNER',early)).startsWith('t||'));expect(report(early),'f|acceptance_required');
 console.log('Schema and preacceptance checks passed');
 assert.ok(sql(respond(token)).startsWith('t||'));expect(`select status from leads where id='${main.lead}'`,'ACCEPTED');
 expect(release(main.assignment),'f|homeowner_permission_required');
 const provider=hash(),providerPrepared=sql(prepare(main.assignment,'VENDOR',provider));assert.ok(providerPrepared.startsWith('t||'));const providerInvite=providerPrepared.split('|')[2];
 expect(`select finish_network_checkin('${providerInvite}','SENT',null)`,'t');expect(`select finish_network_checkin('${providerInvite}','FAILED','later')`,'f');
 expect(report(provider),'f|rating_not_eligible');expect(report(provider,'YES','COMPLETED','null'),'t|');
 expect(report(early),'t|');expect(report(early,'NO','PENDING','null'),'t|already_recorded');
 expect(`select count(*) from network_reports where assignment_id='${main.assignment}'`,'2');expect(`select status from leads where id='${main.lead}'`,'ACCEPTED');
 const rid=sql(`select id from network_reports where party='HOMEOWNER' and assignment_id='${main.assignment}'`);
 expect(`select admin_moderate_network_report('${rid}','DISPUTE','Conflicting account','${actor}')`,'t');expect(`select note||'|'||disputed from network_reports where id='${rid}'`,'Original private feedback|true');expect(`select count(*) from network_review_events where report_id='${rid}'`,'1');
 expect(`select stop_network_checkins('${provider}')`,'f');expect(`select stop_network_checkins('${early}')`,'t');expect(prepare(main.assignment,'HOMEOWNER',hash()),'f|homeowner_checkin_not_permitted||');
 expect(release(main.assignment,true),'t|');expect(respond(token),'f|unavailable|');expect(`select status from leads where id='${main.lead}'`,'QUALIFIED');
 const legacy=fixture(false);expect(prepare(legacy.assignment,'HOMEOWNER',hash()),'f|homeowner_checkin_not_permitted||');
 expect(`select admin_record_network_permission('${legacy.lead}','Homeowner requested follow-up by email','${actor}')`,'t');assert.ok(sql(prepare(legacy.assignment,'HOMEOWNER',hash())).startsWith('t||'));
 const expired=fixture(),expiredToken=hash();sql(offer(expired.assignment,expiredToken));sql(`update lead_assignments set acceptance_due_at=now()-interval '1 second' where id='${expired.assignment}'`);
 expect(respond(expiredToken),'f|offer_expired|');expect(release(expired.assignment),'t|');
 const race=fixture(),raceToken=hash();sql(offer(race.assignment,raceToken));const raceResult=await Promise.all([concurrent(respond(raceToken)),concurrent(respond(raceToken))]);assert.equal(raceResult.filter(x=>x.startsWith('t||')).length,1);assert.equal(raceResult.filter(x=>x.startsWith('f|already_accepted|')).length,1);expect(`select count(*) from lead_assignments where lead_id='${race.lead}' and status='ACCEPTED'`,'1');
 const inviteHash=hash(),inviteRace=await Promise.all([concurrent(prepare(race.assignment,'HOMEOWNER',inviteHash)),concurrent(prepare(race.assignment,'HOMEOWNER',hash()))]);assert.equal(inviteRace.filter(x=>x.startsWith('t||')).length,1);assert.ok(inviteRace.some(x=>x==='f|send_in_progress||'));
 const inviteId=inviteRace.find(x=>x.startsWith('t||')).split('|')[2];expect(`select finish_network_checkin('${inviteId}','UNCERTAIN','provider_unreachable')`,'t');expect(prepare(race.assignment,'HOMEOWNER',hash()),'f|inspect_uncertain_delivery||');assert.ok(sql(prepare(race.assignment,'HOMEOWNER',hash(),true)).startsWith('t||'));expect(report(inviteHash),'f|unavailable');

 // Two different providers cannot be assigned simultaneously; declining reopens manual assignment.
 const providerB=id();sql(`insert into vendors(id,business_name,email)values('${providerB}','Other provider','other@example.invalid')`);
 const declined=fixture(),declineToken=hash();sql(offer(declined.assignment,declineToken));assert.ok(sql(respond(declineToken,'PASS')).startsWith('t||'));expect(respond(declineToken),'f|already_passed|'+declined.lead);
 const assign=(lead,vendorId)=>`select * from admin_assign_lead_to_vendor('${lead}','${vendorId}','${actor}');`;
 const assignments=await Promise.all([concurrent(assign(declined.lead,vendor)),concurrent(assign(declined.lead,providerB))]);assert.equal(assignments.filter(x=>x.startsWith('t|')).length,1);expect(`select count(*) from lead_assignments where lead_id='${declined.lead}' and status in ('ASSIGNED','ACCEPTED')`,'1');
 // Acceptance racing with an expired release never leaves an accepted old offer.
 const expireRace=fixture(),expireHash=hash();sql(offer(expireRace.assignment,expireHash));sql(`update lead_assignments set acceptance_due_at=now()-interval '1 second' where id='${expireRace.assignment}'`);
 await Promise.all([concurrent(respond(expireHash)),concurrent(release(expireRace.assignment))]);expect(`select status from lead_assignments where id='${expireRace.assignment}'`,'CANCELLED');
 // Replacement and acceptance share an advisory lock, preventing the old opposite row-lock order deadlock.
 const renewRace=fixture(),renewHash=hash();sql(offer(renewRace.assignment,renewHash));await Promise.all([concurrent(respond(renewHash)),concurrent(offer(renewRace.assignment,hash()))]);
 expect(`select count(*) from lead_status_events where lead_id='${main.lead}' and event_type='NetworkFallbackRequested' and note like '%homeowner permission%'`,'1');
 for(const role of ['anon','authenticated']){for(const table of ['network_reports','network_invitations','network_review_events'])denied(`set role ${role};select * from ${table}`);denied(`set role ${role};${report(provider)}`);denied(`set role ${role};${release(race.assignment,true)}`);}
 console.log('PASS: all real migrations; operator/provider/homeowner workflow; acceptance gates/deadlines; recovery permission/revocation; immutable duplicate-safe reports; private stars eligibility; no lifecycle auto-completion; moderation audit; optout/legacy permission; concurrent accept/send; uncertain send recovery; public role denial.');
}catch(e){console.error(e.stderr?.toString()??e);process.exitCode=1;}finally{try{execFileSync(join(bin,'pg_ctl'),['-D',join(dir,'data'),'stop','-m','immediate'],{stdio:'ignore'});}catch{}rmSync(dir,{recursive:true,force:true});}
